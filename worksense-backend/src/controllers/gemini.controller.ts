// Actualización del controlador de Gemini para usar inglés como idioma predeterminado
import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { sqlConnect, sql } from "../models/sqlModel.js";
import { Timestamp } from "firebase-admin/firestore";

import { BacklogItemType } from "../../types/BacklogItemType.js";
import { ProjectMember, ProjectContext } from "../../types/project.js";
import { ProjectRole, AvailablePermission } from "../../types/permissions.js";
import { 
  getOrCreateConversation, 
  addMessageToConversation, 
  getConversationHistory,
  extractUserPreferences
} from "../controllers/conversation.controller.js";

export const handleGeminiPrompt = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("📣 Solicitud recibida en handleGeminiPrompt");

  const { prompt, projectId } = req.body;
  // Para desarrollo: si no hay usuario autenticado, usar ID 1 por defecto
  const userId = req.user?.userId || 1;

  if (!prompt || !projectId) {
    res.status(400).json({ message: "Missing prompt or projectId" });
    return;
  }

  try {
    // Obtener o crear la conversación para este usuario y proyecto
    const conversation = await getOrCreateConversation(userId, projectId);
    console.log(`✅ Conversación obtenida/creada con ID: ${conversation.id}`);
    
    // Añadir el mensaje del usuario a la conversación
    const userMessage = {
      role: "user" as const,
      content: prompt,
      timestamp: Timestamp.now()
    };
    
    // Extraer preferencias del usuario del mensaje (si las hay)
    const metadataUpdates = extractUserPreferences(prompt);
    console.log("🧠 Preferencias detectadas:", metadataUpdates);
    
    await addMessageToConversation(conversation.id!, userMessage, metadataUpdates ?? undefined);
    
    // Obtener historial reciente de conversaciones
    const recentMessages = await getConversationHistory(conversation.id!, 10);
    console.log(`📝 Recuperado historial: ${recentMessages.length} mensajes`);

    // Obtener información del proyecto
    const projectRef = db.collection("projects").doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const projectData = projectSnap.data() || {};
    const projectContext: ProjectContext = projectData.context || {};

    // Get available permissions
    const permissionsRef = db.collection("availablePermissions");
    const permissionsSnap = await permissionsRef.get();
    
    const availablePermissions: Map<string, AvailablePermission> = new Map();
    permissionsSnap.forEach((doc) => {
      const permission = doc.data() as AvailablePermission;
      availablePermissions.set(permission.key, permission);
    });

    // Get project roles
    const rolesRef = db.collection("projectRoles");
    const rolesSnap = await rolesRef.get();
    
    const projectRoles: Map<string, ProjectRole> = new Map();
    rolesSnap.forEach((doc) => {
      const role = {
        id: doc.id,
        ...(doc.data() as Omit<ProjectRole, "id">)
      };
      projectRoles.set(doc.id, role);
    });

    // Get backlog items
    const backlogRef = db.collection(`projects/${projectId}/backlog`);
    const backlogSnap = await backlogRef.get();

    const backlogItems: BacklogItemType[] = backlogSnap.docs.map((doc) => ({
      ...(doc.data() as BacklogItemType),
      id: doc.id,
    }));

    // Get team members
    const membersRef = db.collection(`projects/${projectId}/members`);
    const membersSnap = await membersRef.get();
    
    let members: (ProjectMember & { roleName?: string; permissions?: string[] })[] = [];
    const userIds: number[] = [];
    
    // Extract basic member info
    membersSnap.forEach((doc) => {
      const memberData = doc.data();
      const memberId = parseInt(doc.id, 10);
      userIds.push(memberId);
      members.push({
        userId: memberId,
        projectRoleId: memberData.projectRoleId || "",
        joinedAt: memberData.joinedAt
      });
    });
    
    // Enrich members with role and permission information
    const rolePromises = members.map(async (member) => {
      if (member.projectRoleId) {
        const role = projectRoles.get(member.projectRoleId);
        if (role) {
          return {
            ...member,
            roleName: role.name,
            permissions: role.permissions
          };
        }
      }
      return member;
    });
    
    // Enrich member data with user details from SQL if possible
    try {
      if (userIds.length > 0) {
        const pool = await sqlConnect();
        if (pool) {
          const userIdsString = userIds.join(",");
          const result = await pool
            .request()
            .input("UserIds", sql.NVarChar(sql.MAX), userIdsString)
            .execute("spGetUsersByIds");

          if (result.recordset && result.recordset.length > 0) {
            // Create a map of user data
            const userDataMap = new Map();
            result.recordset.forEach((userData) => {
              userDataMap.set(userData.id, userData);
            });

            // Wait for role information and then enrich with user data
            members = await Promise.all(rolePromises);
            
            // Add user details to members
            members = members.map((member) => {
              const userData = userDataMap.get(member.userId);
              if (userData) {
                return {
                  ...member,
                  name: `${userData.firstName} ${userData.lastName}`,
                  fullName: `${userData.firstName} ${userData.lastName}`,
                  email: userData.email
                };
              }
              return member;
            });
          }
        }
      } else {
        // Just wait for role information if no SQL enrichment
        members = await Promise.all(rolePromises);
      }
    } catch (sqlError) {
      console.error("Error fetching member details:", sqlError);
      // Continue with basic member info if SQL fails
      members = await Promise.all(rolePromises);
    }

    // Agrupar por tipo
    const stories: BacklogItemType[] = [];
    const bugs: BacklogItemType[] = [];
    const techTasks: BacklogItemType[] = [];
    const knowledgeItems: BacklogItemType[] = [];
    const epics: BacklogItemType[] = [];

    for (const item of backlogItems) {
      switch (item.type) {
        case "story":
          stories.push(item);
          break;
        case "bug":
          bugs.push(item);
          break;
        case "techTask":
          techTasks.push(item);
          break;
        case "knowledge":
          knowledgeItems.push(item);
          break;
        case "epic":
          epics.push(item);

          const subitemsSnap = await db
            .collection(`projects/${projectId}/backlog/${item.id}/subitems`)
            .get();

          const subitems: BacklogItemType[] = subitemsSnap.docs.map((doc) => ({
            ...(doc.data() as BacklogItemType),
            id: doc.id
          }));

          // Add each story from the epic to the stories array
          subitems.forEach((sub) => {
            if (sub.type === "story") {
              stories.push({
                ...sub,
                parentId: item.name || "Unnamed Epic",
              });
            }
          });

          break;
      }
    }

    // Create a human-readable list of permissions for each role
    const rolePermissionDescriptions: Record<string, string[]> = {};
    projectRoles.forEach((role) => {
      const permDescriptions: string[] = [];
      
      role.permissions.forEach((permKey) => {
        const permission = availablePermissions.get(permKey);
        if (permission) {
          permDescriptions.push(`${permission.description} (${permission.key})`);
        } else {
          permDescriptions.push(permKey);
        }
      });
      
      if (role.id) {
        rolePermissionDescriptions[role.id] = permDescriptions;
      }
    });

    // Obtener el miembro actual (el usuario que está haciendo la pregunta)
    const currentMember = members.find(m => m.userId === userId);
    
    // Obtener las preferencias del usuario de la conversación
    const userPreferences = conversation.metadata?.userPreferences || {};
    const userNickname = userPreferences.nickname;
    
    // CAMBIO PRINCIPAL: El idioma predeterminado ahora es inglés ('en')
    const preferredLanguage = userPreferences.preferredLanguage || 'en'; 
    
    const verbosityLevel = conversation.metadata?.assistantSettings?.verbosityLevel || 'normal';
    
    // Construir el historial de la conversación para el contexto
    const conversationHistory = recentMessages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');

    // Detectar idioma del mensaje actual para adaptarse dinámicamente
    const messageLanguage = detectLanguage(prompt);
    console.log(`🌐 Idioma detectado en el mensaje: ${messageLanguage}`);

    const contextPrompt = `
        You are Frida, a smart assistant helping with project management.

        ### 👤 Current User Context
        ${currentMember ? `- You are talking to: ${currentMember.fullName || currentMember.name || `User ${userId}`}` : '- Unknown user'}
        ${currentMember ? `- Their role is: ${currentMember.roleName || 'Unknown'}` : ''}
        ${userNickname ? `- They prefer to be called: "${userNickname}"` : ''}
        ${verbosityLevel !== 'normal' ? `- They prefer ${verbosityLevel} responses` : ''}
        ${preferredLanguage ? `- Their preferred language is: ${preferredLanguage === 'es' ? 'Spanish' : 'English'}` : ''}

        ### 💬 Recent Conversation History
        ${conversationHistory ? conversationHistory : 'This is the start of your conversation.'}

        Use the following project context to answer the user's question.

        ---

        ### 🗂 Project Info
        - Name: ${projectData.name || "N/A"}
        - Description: ${projectData.description || "No description provided."}
        - Owner ID: ${projectData.ownerId || "Unknown"}
        ${projectContext.techStack ? `- Tech Stack: ${projectContext.techStack.join(", ")}` : ""}
        ${projectContext.objectives ? `- Objectives: ${projectContext.objectives}` : ""}
        - Status: ${projectData.status || "active"}

        ### 👥 Team Members and Roles
        ${
          members.length > 0
            ? members
                .map((m) => {
                  const memberName = m.fullName || m.name || `User ${m.userId}`;
                  const roleName = m.roleName || m.projectRoleId || "Unknown Role";
                  const email = m.email ? ` (${m.email})` : "";
                  
                  let memberInfo = `- ${memberName}: ${roleName}${email}`;
                  
                  // Add permissions if available
                  if (m.projectRoleId && rolePermissionDescriptions[m.projectRoleId]) {
                    const permissions = rolePermissionDescriptions[m.projectRoleId];
                    if (permissions.length > 0) {
                      memberInfo += `\n  Permissions: ${permissions.slice(0, 3).join(", ")}${permissions.length > 3 ? ` and ${permissions.length - 3} more` : ""}`;
                    }
                  }
                  
                  return memberInfo;
                })
                .join("\n")
            : "No team members found."
        }

        ### 🔑 Project Roles
        ${
          Array.from(projectRoles.values()).length > 0
            ? Array.from(projectRoles.values())
                .map((role) => {
                  const permissionsList = rolePermissionDescriptions[role.id || ""] || [];
                  return `- ${role.name}:\n  ${
                    permissionsList.length > 0 
                      ? permissionsList.join("\n  ") 
                      : "No permissions defined"
                  }`;
                })
                .join("\n\n")
            : "No project roles defined."
        }

        ### 🧱 Epics
        ${
          epics.length > 0
            ? epics
                .map((e) => `- ${e.name} (${e.status || "unknown"})${
                  e.assigneeId ? ` [Assigned to: ${members.find(m => m.userId === e.assigneeId)?.fullName || members.find(m => m.userId === e.assigneeId)?.name || `User ${e.assigneeId}`}]` : ""
                }`)
                .join("\n")
            : "No epics found."
        }

        ### 📚 Stories
        ${
          stories.length > 0
            ? stories
                .map(
                  (s) =>
                    `- ${s.name} (${s.size || "?"} pts) ${
                      s.parentId ? `(from epic: ${s.parentId})` : ""
                    }${
                      s.assigneeId ? ` [Assigned to: ${members.find(m => m.userId === s.assigneeId)?.fullName || members.find(m => m.userId === s.assigneeId)?.name || `User ${s.assigneeId}`}]` : ""
                    }`
                )
                .join("\n")
            : "No stories found."
        }

        ### 🐞 Bugs
        ${
          bugs.length > 0
            ? bugs
                .map((b) => `- ${b.name} [${b.size || "medium"}]${
                  b.assigneeId ? ` [Assigned to: ${members.find(m => m.userId === b.assigneeId)?.fullName || members.find(m => m.userId === b.assigneeId)?.name || `User ${b.assigneeId}`}]` : ""
                }`)
                .join("\n")
            : "No bugs found."
        }

        ### 🛠 Tech Tasks
        ${
          techTasks.length > 0
            ? techTasks
                .map((t) => `- ${t.name}${
                  t.assigneeId ? ` [Assigned to: ${members.find(m => m.userId === t.assigneeId)?.fullName || members.find(m => m.userId === t.assigneeId)?.name || `User ${t.assigneeId}`}]` : ""
                }`)
                .join("\n")
            : "No tech tasks found."
        }

        ### 📘 Knowledge Items
        ${
          knowledgeItems.length > 0
            ? knowledgeItems
                .map((k) => `- ${k.name}${
                  k.assigneeId ? ` [Assigned to: ${members.find(m => m.userId === k.assigneeId)?.fullName || members.find(m => m.userId === k.assigneeId)?.name || `User ${k.assigneeId}`}]` : ""
                }`)
                .join("\n")
            : "No knowledge items found."
        }

        ---

        ### ❓ User's Question
        "${prompt}"

        Provide a helpful and prioritized answer based on the context.
        ${preferredLanguage === 'es' ? 'Responde siempre en español.' : 'Always respond in English.'}
        ${userNickname ? `${preferredLanguage === 'es' ? 'Dirígete al usuario como' : 'Address the user as'} "${userNickname}" ${preferredLanguage === 'es' ? 'de vez en cuando.' : 'occasionally.'}` : ''}
        ${verbosityLevel === 'concise' 
          ? (preferredLanguage === 'es' 
              ? 'Sé conciso y directo en tu respuesta, evita detalles innecesarios.' 
              : 'Be concise and direct in your response, avoid unnecessary details.')
          : verbosityLevel === 'detailed' 
              ? (preferredLanguage === 'es' 
                  ? 'Proporciona respuestas detalladas con toda la información disponible.' 
                  : 'Provide detailed responses with all available information.')
              : (preferredLanguage === 'es' 
                  ? 'Proporciona una respuesta equilibrada con información relevante.' 
                  : 'Provide a balanced response with relevant information.')
        }
        When discussing team members, acknowledge their roles and permissions.
        When discussing backlog items, mention who they're assigned to if applicable.
        If the user asks about team responsibilities, who is working on what, or who has permission to do something, provide that information based on the roles and permissions.
        ${messageLanguage === 'es' && preferredLanguage !== 'es' 
          ? 'The user is writing in Spanish but your configured language is English. ' +
            'Consider responding in Spanish for this message or asking if they prefer to switch to Spanish permanently.'
          : ''}
        `.trim();

    console.log("🧠 Prompt contextual construido con inglés como idioma predeterminado");

    // Comprobar si estamos en modo simulado para pruebas
    if (process.env.USE_MOCK_GEMINI === 'true') {
      console.log("🤖 Usando respuesta simulada para pruebas");
      
      // Respuesta simulada para pruebas
      let mockReply;
      
      if (preferredLanguage === 'es') {
        mockReply = userNickname 
          ? `Hola ${userNickname}, estoy aquí para ayudarte con la gestión de tu proyecto.` 
          : `Hola, estoy aquí para ayudarte con la gestión de tu proyecto.`;
      } else {
        mockReply = userNickname 
          ? `Hello ${userNickname}, I'm here to help you with project management.` 
          : `Hello, I'm here to help you with project management.`;
      }
      
      const assistantMessage = {
        role: "assistant" as const,
        content: mockReply,
        timestamp: Timestamp.now()
      };
      
      await addMessageToConversation(conversation.id!, assistantMessage);
      
      res.json({ 
        reply: mockReply,
        timestamp: new Date().toISOString(),
        conversation: {
          id: conversation.id,
          metadata: conversation.metadata
        }
      });
      return;
    }

    // Si llegamos aquí, usamos la API real de Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    // Enhanced Gemini model parameters
    const body = {
      contents: [
        {
          parts: [{ text: contextPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    try {
      console.log("🌐 Enviando solicitud a Gemini API");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errJson = await response.json();
        console.error("❌ Gemini API error:", errJson);
        throw new Error(`Gemini API error: ${errJson.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("✅ Respuesta recibida de Gemini");

      if (reply) {
        // Añadir la respuesta del asistente a la conversación
        const assistantMessage = {
          role: "assistant" as const,
          content: reply,
          timestamp: Timestamp.now()
        };
        
        await addMessageToConversation(conversation.id!, assistantMessage);
        
        // Log assistant responses for quality monitoring (optional)
        console.log(`Frida assistant response for project ${projectId}: ${reply.substring(0, 100)}...`);
    
        res.json({ 
          reply,
          timestamp: new Date().toISOString(),
          conversation: {
            id: conversation.id,
            metadata: conversation.metadata
          }
        });
      } else {
        // Si no hay respuesta de Gemini
        console.warn("⚠️ No se recibió respuesta de Gemini");
        
        // Respuesta de fallback
        const fallbackReply = preferredLanguage === 'es'
          ? `Lo siento${userNickname ? `, ${userNickname}` : ''}, no pude generar una respuesta en este momento. Por favor, inténtalo de nuevo.`
          : `I'm sorry${userNickname ? `, ${userNickname}` : ''}, I couldn't generate a response at this time. Please try again.`;
          
        const assistantMessage = {
          role: "assistant" as const,
          content: fallbackReply,
          timestamp: Timestamp.now()
        };
        
        await addMessageToConversation(conversation.id!, assistantMessage);
        
        res.json({ 
          reply: fallbackReply,
          timestamp: new Date().toISOString(),
          conversation: {
            id: conversation.id,
            metadata: conversation.metadata
          }
        });
      }
    } catch (apiError) {
      console.error("❌ Error llamando a la API de Gemini:", apiError);
      
      // Respuesta de fallback en caso de error
      const fallbackReply = preferredLanguage === 'es'
        ? `Lo siento${userNickname ? `, ${userNickname}` : ''}, estoy teniendo problemas para responder. Por favor, inténtalo de nuevo más tarde.`
        : `I'm sorry${userNickname ? `, ${userNickname}` : ''}, I'm having trouble responding. Please try again later.`;
        
      res.json({
        reply: fallbackReply,
        timestamp: new Date().toISOString(),
        error: typeof apiError === 'object' && apiError !== null && 'message' in apiError ? (apiError as any).message : String(apiError),
        conversation: {
          id: conversation.id,
          metadata: conversation.metadata
        }
      });
    }
  } catch (err) {
    console.error("❌ Error general:", err);
    res.status(500).json({ 
      message: "Error interno del servidor", 
      error: typeof err === 'object' && err !== null && 'message' in err ? (err as any).message : String(err)
    });
  }
};

/**
 * Detecta el idioma del mensaje del usuario de forma simple
 */
function detectLanguage(text: string): string {
  // Lista de palabras comunes en español
  const spanishWords = ['hola', 'gracias', 'por favor', 'ayuda', 'qué', 'cómo', 'quién', 'cuál', 'dónde', 'cuándo',
    'buenos días', 'buenas tardes', 'buenas noches', 'me gustaría', 'necesito', 'tengo', 'puedes', 'podrías'];
  
  // Convertir a minúsculas para comparar
  const lowerText = text.toLowerCase();
  
  // Contar cuántas palabras en español contiene
  let spanishWordCount = 0;
  spanishWords.forEach(word => {
    if (lowerText.includes(word)) {
      spanishWordCount++;
    }
  });
  
  // También buscar caracteres específicos del español como acentos y ñ
  const spanishChars = /[áéíóúüñ¿¡]/;
  const hasSpanishChars = spanishChars.test(lowerText);
  
  // Si hay suficientes indicadores, considerar que es español
  return (spanishWordCount >= 2 || hasSpanishChars) ? 'es' : 'en';
}
