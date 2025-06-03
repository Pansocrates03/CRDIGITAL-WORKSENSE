import { Request, Response } from "express";
import { sqlConnect, sql } from "../models/sqlModel.js";
import { Timestamp } from "firebase-admin/firestore";
import { projectCacheService } from "../service/projectCache.service.js";
import {
  getOrCreateConversation,
  addMessageToConversation,
  getConversationHistory,
  extractUserPreferences,
} from "../controllers/conversation.controller.js";

// Keep track of active subscriptions
const activeSubscriptions = new Map<string, () => void>();

/**
 * Helper function to check if a question is project-related
 */
const isProjectRelatedQuestion = (prompt: string): boolean => {
  const projectKeywords = [
    // Project management terms
    "project",
    "task",
    "sprint",
    "backlog",
    "epic",
    "story",
    "bug",
    "team",
    "member",
    "assignee",
    "progress",
    "status",
    "deadline",
    "milestone",
    "deliverable",
    "requirement",
    "feature",

    // Spanish equivalents
    "proyecto",
    "tarea",
    "equipo",
    "miembro",
    "progreso",
    "estado",
    "entrega",
    "requisito",
    "funcionalidad",
    "historia",

    // Action words related to project management
    "assign",
    "complete",
    "review",
    "plan",
    "estimate",
    "develop",
    "asignar",
    "completar",
    "revisar",
    "planear",
    "estimar",
    "desarrollar",

    // Questions about work
    "who is working",
    "what is pending",
    "when is due",
    "how many",
    "quién está trabajando",
    "qué está pendiente",
    "cuándo vence",
    "cuántos",
  ];

  const lowerPrompt = prompt.toLowerCase();

  // Check if the prompt contains project-related keywords
  const hasProjectKeywords = projectKeywords.some((keyword) =>
    lowerPrompt.includes(keyword.toLowerCase())
  );

  // Check for obvious non-project questions
  const nonProjectIndicators = [
    "weather",
    "recipe",
    "movie",
    "music",
    "sports",
    "news",
    "celebrity",
    "clima",
    "receta",
    "película",
    "música",
    "deportes",
    "noticias",
    "what is the capital of",
    "how to cook",
    "tell me a joke",
    "cuál es la capital de",
    "cómo cocinar",
    "cuéntame un chiste",
  ];

  const hasNonProjectIndicators = nonProjectIndicators.some((indicator) =>
    lowerPrompt.includes(indicator.toLowerCase())
  );

  // If it clearly has non-project indicators and no project keywords, it's off-topic
  if (hasNonProjectIndicators && !hasProjectKeywords) {
    return false;
  }

  // If it has project keywords, it's likely project-related
  if (hasProjectKeywords) {
    return true;
  }

  // For ambiguous cases, allow them but the AI will be instructed to redirect
  return true;
};

export const handleGeminiPrompt = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("Solicitud recibida en handleGeminiPrompt");

  const { prompt, projectId } = req.body;
  const userId = req.user?.userId || 1;

  if (!prompt || !projectId) {
    res.status(400).json({ message: "Missing prompt or projectId" });
    return;
  }

  try {
    // Check if the question is project-related
    if (!isProjectRelatedQuestion(prompt)) {
      const userPreferences = await getOrCreateConversation(userId, projectId);
      const preferredLanguage =
        userPreferences.metadata?.userPreferences?.preferredLanguage || "en";

      const offTopicResponse =
        preferredLanguage === "es"
          ? "Lo siento, pero solo puedo ayudarte con preguntas relacionadas con tu proyecto. ¿Hay algo específico sobre el proyecto en lo que pueda asistirte?"
          : "I'm sorry, but I can only help you with questions related to your project. Is there something specific about the project I can assist you with?";

      res.json({
        reply: offTopicResponse,
        timestamp: new Date().toISOString(),
        isOffTopic: true,
      });
      return;
    }

    // Set up real-time subscription if not already active
    if (!activeSubscriptions.has(projectId)) {
      const unsubscribe =
        projectCacheService.subscribeToProjectUpdates(projectId);
      activeSubscriptions.set(projectId, unsubscribe);
      console.log(`📡 Set up real-time updates for project ${projectId}`);
    }

    // Get or create conversation
    const conversation = await getOrCreateConversation(userId, projectId);
    console.log(`Conversación obtenida/creada con ID: ${conversation.id}`);

    // Add user message to conversation
    const userMessage = {
      role: "user" as const,
      content: prompt,
      timestamp: Timestamp.now(),
    };

    // Extract user preferences
    const metadataUpdates = extractUserPreferences(prompt);
    console.log("🧠 Preferencias detectadas:", metadataUpdates);

    await addMessageToConversation(
      conversation.id!,
      userMessage,
      metadataUpdates ?? undefined
    );

    // Get conversation history
    const recentMessages = await getConversationHistory(conversation.id!, 8); // Reduced for more concise context
    console.log(`📝 Recuperado historial: ${recentMessages.length} mensajes`);

    // Get cached project data
    const cachedData = await projectCacheService.getProjectData(projectId);

    if (!cachedData) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const {
      projectData,
      members,
      backlogItems,
      projectRoles,
      availablePermissions,
      sprints,
      tasks,
    } = cachedData;

    // Extract AI configuration from project data
    const aiConfig = {
      aiContext: projectData.aiContext || projectData.context?.objectives || "",
      aiTechStack:
        projectData.aiTechStack ||
        projectData.context?.techStack?.join(", ") ||
        "",
      enableAiSuggestions: projectData.enableAiSuggestions !== false,
    };

    // Enrich members with SQL data if needed
    let enrichedMembers = members;
    const userIds = members.map((m) => m.userId);

    if (userIds.length > 0) {
      try {
        const pool = await sqlConnect();
        if (pool) {
          const userIdsString = userIds.join(",");
          const result = await pool
            .request()
            .input("UserIds", sql.NVarChar(sql.MAX), userIdsString)
            .execute("spGetUsersByIds");

          if (result.recordset && result.recordset.length > 0) {
            const userDataMap = new Map();
            result.recordset.forEach((userData) => {
              userDataMap.set(userData.id, userData);
            });

            enrichedMembers = members.map((member) => {
              const userData = userDataMap.get(member.userId);
              const role = projectRoles.get(member.projectRoleId);

              return {
                ...member,
                name: userData
                  ? `${userData.firstName} ${userData.lastName}`
                  : undefined,
                fullName: userData
                  ? `${userData.firstName} ${userData.lastName}`
                  : undefined,
                email: userData?.email,
                roleName: role?.name,
                permissions: role?.permissions,
              };
            });
          }
        }
      } catch (sqlError) {
        console.error("Error fetching member details from SQL:", sqlError);
      }
    }

    // Group backlog items by type
    const stories = backlogItems.filter((item) => item.type === "story");
    const bugs = backlogItems.filter((item) => item.type === "bug");
    const techTasks = backlogItems.filter((item) => item.type === "techTask");
    const knowledgeItems = backlogItems.filter(
      (item) => item.type === "knowledge"
    );
    const epics = backlogItems.filter((item) => item.type === "epic");

    // Process sprints
    const activeSprint = sprints.find((s) => s.status === "Active");
    const plannedSprints = sprints.filter((s) => s.status === "Planned");
    const completedSprints = sprints.filter((s) => s.status === "Completed");

    // Group tasks by status
    const tasksByStatus = {
      todo: tasks.filter((t) => t.status === "todo"),
      inProgress: tasks.filter(
        (t) => t.status === "in-progress" || t.status === "inProgress"
      ),
      review: tasks.filter((t) => t.status === "review"),
      done: tasks.filter((t) => t.status === "done"),
    };

    // If there's an active sprint, get its tasks
    const activeSprintTasks = activeSprint
      ? tasks.filter((t) => t.sprintId === activeSprint.id)
      : [];

    // Create role permission descriptions
    const rolePermissionDescriptions: Record<string, string[]> = {};
    projectRoles.forEach((role) => {
      const permDescriptions: string[] = [];

      role.permissions.forEach((permKey) => {
        const permission = availablePermissions.get(permKey);
        if (permission) {
          permDescriptions.push(
            `${permission.description} (${permission.key})`
          );
        } else {
          permDescriptions.push(permKey);
        }
      });

      if (role.id) {
        rolePermissionDescriptions[role.id] = permDescriptions;
      }
    });

    // Get current member and preferences
    const currentMember = enrichedMembers.find((m) => m.userId === userId);
    const userPreferences = conversation.metadata?.userPreferences || {};
    const userNickname = userPreferences.nickname;
    const preferredLanguage = userPreferences.preferredLanguage || "en";
    const verbosityLevel =
      conversation.metadata?.assistantSettings?.verbosityLevel || "concise"; // Changed default to concise

    // Build conversation history
    const conversationHistory = recentMessages
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n\n");

    // Detect language
    const messageLanguage = detectLanguage(prompt);
    console.log(`Idioma detectado en el mensaje: ${messageLanguage}`);

    // Build context prompt with improved instructions
    const contextPrompt = `
You are Frida, a concise and focused project management assistant. You ONLY answer questions related to project management, team members, tasks, sprints, and project-related activities.

### STRICT GUIDELINES:
- ONLY answer questions related to this project and its management
- If asked about topics unrelated to project management (weather, cooking, general knowledge, etc.), politely redirect to project-related topics
- Keep responses concise and to the point unless specifically asked for details
- Use markdown formatting for better readability (lists, headers, bold text, etc.)
- Focus on actionable information and current project status

${
  aiConfig.enableAiSuggestions
    ? `### AI Configuration
${aiConfig.aiContext ? `Project Context: ${aiConfig.aiContext}` : ""}
${aiConfig.aiTechStack ? `Tech Stack: ${aiConfig.aiTechStack}` : ""}
Provide proactive suggestions when relevant.`
    : "AI suggestions are disabled. Provide direct answers only."
}

### Current User
${
  currentMember
    ? `- **User**: ${
        currentMember.fullName || currentMember.name || `User ${userId}`
      }`
    : "- **User**: Unknown"
}
${currentMember ? `- **Role**: ${currentMember.roleName || "Unknown"}` : ""}
${userNickname ? `- **Preferred Name**: "${userNickname}"` : ""}

### Recent Context
${conversationHistory || "First interaction in this session."}

### Project Overview
**${projectData.name || "Project"}** | Status: ${projectData.status || "active"}
${projectData.description ? `${projectData.description}` : ""}

### Current Sprint Status
${
  activeSprint
    ? `**🏃 Active Sprint**: ${activeSprint.name}
- **Goal**: ${activeSprint.goal || "No goal set"}
- **Timeline**: ${
        activeSprint.startDate?.toDate?.()?.toLocaleDateString() || "N/A"
      } → ${activeSprint.endDate?.toDate?.()?.toLocaleDateString() || "N/A"}
- **Tasks**: ${activeSprintTasks.length} total (${
        activeSprintTasks.filter((t) => t.status === "done").length
      } done, ${
        activeSprintTasks.filter(
          (t) => t.status === "in-progress" || t.status === "inProgress"
        ).length
      } in progress)`
    : "**No active sprint currently running**"
}

### Team Summary
${enrichedMembers.length} team members:
${enrichedMembers
  .slice(0, 5)
  .map((m) => {
    const memberName = m.fullName || m.name || `User ${m.userId}`;
    const roleName = m.roleName || "Unknown Role";
    return `- **${memberName}**: ${roleName}`;
  })
  .join("\n")}
${
  enrichedMembers.length > 5
    ? `... and ${enrichedMembers.length - 5} more members`
    : ""
}

### Quick Stats
- **📋 Backlog**: ${stories.length} stories, ${bugs.length} bugs, ${
      techTasks.length
    } tech tasks
- **🎯 Epics**: ${epics.length} total
- **📊 All Tasks**: ${tasksByStatus.todo.length} todo, ${
      tasksByStatus.inProgress.length
    } in progress, ${tasksByStatus.review.length} in review, ${
      tasksByStatus.done.length
    } done

### User Question
"${prompt}"

### Response Instructions
${preferredLanguage === "es" ? "Responde en español." : "Respond in English."}
${userNickname ? `Address the user as "${userNickname}" occasionally.` : ""}

**Keep your response concise and focused**. Use markdown formatting for clarity:
- Use **bold** for important items
- Use bullet points for lists
- Use headers (##) for sections when needed
- Use \`code\` for technical terms

If the question is not project-related, politely redirect: "${
      preferredLanguage === "es"
        ? "Solo puedo ayudarte con temas relacionados al proyecto. ¿Hay algo específico del proyecto que quieras saber?"
        : "I can only help with project-related topics. Is there something specific about the project you'd like to know?"
    }"
`.trim();

    console.log("🧠 Prompt contextual construido con mejoras de concisión");

    // Call Gemini API with updated configuration for conciseness
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const body = {
      contents: [
        {
          parts: [{ text: contextPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2, // Lower temperature for more focused responses
        topP: 0.7, // Reduced for more concise responses
        topK: 30, // Reduced for more focused responses
        maxOutputTokens: 1024, // Reduced from 2048 for more concise responses
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
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
        throw new Error(
          `Gemini API error: ${errJson.error?.message || "Unknown error"}`
        );
      }

      const data = await response.json();
      let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("✅ Respuesta recibida de Gemini");

      if (reply) {
        // Clean up the reply to ensure proper markdown formatting
        reply = reply.trim();

        // Add assistant message to conversation
        const assistantMessage = {
          role: "assistant" as const,
          content: reply,
          timestamp: Timestamp.now(),
        };

        await addMessageToConversation(conversation.id!, assistantMessage);

        // Log cache stats
        const cacheStats = projectCacheService.getCacheStats();
        console.log(
          `📊 Cache stats: ${cacheStats.size} projects cached, ~${(
            cacheStats.memoryUsage / 1024
          ).toFixed(2)}KB memory used`
        );

        res.json({
          reply,
          timestamp: new Date().toISOString(),
          conversation: {
            id: conversation.id,
            metadata: conversation.metadata,
          },
          cacheHit: cachedData.lastUpdated > Date.now() - 300000,
          hasMarkdown:
            reply.includes("**") ||
            reply.includes("##") ||
            reply.includes("`") ||
            reply.includes("-"),
        });
      } else {
        // Fallback response
        console.warn("⚠️ No se recibió respuesta de Gemini");

        const fallbackReply =
          preferredLanguage === "es"
            ? `Lo siento${
                userNickname ? `, ${userNickname}` : ""
              }, no pude generar una respuesta en este momento. Por favor, inténtalo de nuevo.`
            : `I'm sorry${
                userNickname ? `, ${userNickname}` : ""
              }, I couldn't generate a response at this time. Please try again.`;

        const assistantMessage = {
          role: "assistant" as const,
          content: fallbackReply,
          timestamp: Timestamp.now(),
        };

        await addMessageToConversation(conversation.id!, assistantMessage);

        res.json({
          reply: fallbackReply,
          timestamp: new Date().toISOString(),
          conversation: {
            id: conversation.id,
            metadata: conversation.metadata,
          },
        });
      }
    } catch (apiError) {
      console.error("❌ Error llamando a la API de Gemini:", apiError);

      const fallbackReply =
        preferredLanguage === "es"
          ? `Lo siento${
              userNickname ? `, ${userNickname}` : ""
            }, estoy teniendo problemas para responder. Por favor, inténtalo de nuevo más tarde.`
          : `I'm sorry${
              userNickname ? `, ${userNickname}` : ""
            }, I'm having trouble responding. Please try again later.`;

      res.json({
        reply: fallbackReply,
        timestamp: new Date().toISOString(),
        error:
          typeof apiError === "object" &&
          apiError !== null &&
          "message" in apiError
            ? (apiError as any).message
            : String(apiError),
        conversation: {
          id: conversation.id,
          metadata: conversation.metadata,
        },
      });
    }
  } catch (err) {
    console.error("❌ Error general:", err);
    res.status(500).json({
      message: "Error interno del servidor",
      error:
        typeof err === "object" && err !== null && "message" in err
          ? (err as any).message
          : String(err),
    });
  }
};

/**
 * Cleanup subscriptions when server shuts down
 */
export const cleanupSubscriptions = () => {
  activeSubscriptions.forEach((unsubscribe, projectId) => {
    unsubscribe();
    console.log(`🧹 Cleaned up subscription for project ${projectId}`);
  });
  activeSubscriptions.clear();
  projectCacheService.clearCache();
};

// Helper function remains the same
function detectLanguage(text: string): string {
  const spanishWords = [
    "hola",
    "gracias",
    "por favor",
    "ayuda",
    "qué",
    "cómo",
    "quién",
    "cuál",
    "dónde",
    "cuándo",
    "buenos días",
    "buenas tardes",
    "buenas noches",
    "me gustaría",
    "necesito",
    "tengo",
    "puedes",
    "podrías",
  ];

  const lowerText = text.toLowerCase();

  let spanishWordCount = 0;
  spanishWords.forEach((word) => {
    if (lowerText.includes(word)) {
      spanishWordCount++;
    }
  });

  const spanishChars = /[áéíóúüñ¿¡]/;
  const hasSpanishChars = spanishChars.test(lowerText);

  return spanishWordCount >= 2 || hasSpanishChars ? "es" : "en";
}
