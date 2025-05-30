import { Request, Response } from "express";
import { Timestamp } from "firebase-admin/firestore";
import { projectCacheService } from "../service/projectCacheService.js";
import {
  getOrCreateConversation,
  addMessageToConversation,
  getConversationHistory,
  extractUserPreferences,
} from "../controllers/conversation.controller.js";

// Keep track of active subscriptions
const activeSubscriptions = new Map<string, () => void>();

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
    const recentMessages = await getConversationHistory(conversation.id!, 10);
    console.log(`📝 Recuperado historial: ${recentMessages.length} mensajes`);

    // Get cached project data
    const cachedData = await projectCacheService.getProjectData(projectId);

    if (!cachedData) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const { projectData, members, stories, bugs, tickets, sprints } =
      cachedData;

    // Extract AI configuration from project data
    const aiConfig = {
      aiContext: projectData.aiContext || projectData.context?.objectives || "",
      aiTechStack:
        projectData.aiTechStack ||
        projectData.context?.techStack?.join(", ") ||
        "",
      enableAiSuggestions: projectData.enableAiSuggestions !== false, // Default to true
    };

    // Process sprints
    const activeSprint = sprints.find((s) => s.status === "Active");
    const plannedSprints = sprints.filter((s) => s.status === "Planned");
    const completedSprints = sprints.filter((s) => s.status === "Completed");

    // Group tickets by status
    const ticketsByStatus = {
      todo: tickets.filter((t) => t.status === "todo"),
      inProgress: tickets.filter(
        (t) => t.status === "in-progress" || t.status === "inProgress"
      ),
      review: tickets.filter((t) => t.status === "review"),
      done: tickets.filter((t) => t.status === "done"),
    };

    // If there's an active sprint, get its tickets
    const activeSprintTickets = activeSprint
      ? tickets.filter((t) => t.sprintId === activeSprint.id)
      : [];

    // Get current member and preferences
    const currentMember = members.find((m) => m.userId === userId);
    const userPreferences = conversation.metadata?.userPreferences || {};
    const userNickname = userPreferences.nickname;
    const preferredLanguage = userPreferences.preferredLanguage || "en";
    const verbosityLevel =
      conversation.metadata?.assistantSettings?.verbosityLevel || "normal";

    // Build conversation history
    const conversationHistory = recentMessages
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n\n");

    // Detect language
    const messageLanguage = detectLanguage(prompt);
    console.log(`Idioma detectado en el mensaje: ${messageLanguage}`);

    // Build context prompt with AI configuration
    const contextPrompt = `
        You are Frida, a smart assistant helping with project management.
        
        ${
          aiConfig.enableAiSuggestions
            ? `### AI Configuration
        ${aiConfig.aiContext ? `Project Context: ${aiConfig.aiContext}` : ""}
        ${
          aiConfig.aiTechStack
            ? `Tech Stack Focus: ${aiConfig.aiTechStack}`
            : ""
        }
        You should provide proactive suggestions and insights based on this context.
        `
            : "AI suggestions are disabled for this project. Provide answers but avoid proactive suggestions."
        }

        ### Current User Context
        ${
          currentMember
            ? `- You are talking to: ${
                currentMember.fullName || currentMember.name || `User ${userId}`
              }`
            : "- Unknown user"
        }
        ${
          currentMember
            ? `- Their role is: ${currentMember.projectRoleId || "No Role"}`
            : ""
        }
        ${userNickname ? `- They prefer to be called: "${userNickname}"` : ""}
        ${
          verbosityLevel !== "normal"
            ? `- They prefer ${verbosityLevel} responses`
            : ""
        }
        ${
          preferredLanguage
            ? `- Their preferred language is: ${
                preferredLanguage === "es" ? "Spanish" : "English"
              }`
            : ""
        }

        ### Recent Conversation History
        ${
          conversationHistory
            ? conversationHistory
            : "This is the start of your conversation."
        }

        Use the following project context to answer the user's question.

        ---

        ### Project Info
        - Name: ${projectData.name || "N/A"}
        - Description: ${projectData.description || "No description provided."}
        - Owner ID: ${projectData.ownerId || "Unknown"}
        ${
          projectData.context?.techStack
            ? `- Tech Stack: ${projectData.context.techStack.join(", ")}`
            : ""
        }
        ${
          projectData.context?.objectives
            ? `- Objectives: ${projectData.context.objectives}`
            : ""
        }
        - Status: ${projectData.status || "active"}

        ### Team Members and Roles (${members.length} members)
        ${
          members.length > 0
            ? members
                .map((m) => {
                  const memberName = m.fullName || m.name || `User ${m.userId}`;
                  const roleName = m.projectRoleId || "No Role";
                  const email = m.email ? ` (${m.email})` : "";

                  return `- ${memberName}: ${roleName}${email}`;
                })
                .join("\n")
            : "No team members found."
        }

        ### Work Items Summary
        - ${stories.length} Stories
        - ${bugs.length} Bugs
        - ${tickets.length} Tickets

        ### Sprint Information
        ${
          activeSprint
            ? `
        **Active Sprint: ${activeSprint.name}**
        - Goal: ${activeSprint.goal || "No goal set"}
        - Period: ${
          activeSprint.startDate?.toDate?.()?.toLocaleDateString() || "N/A"
        } to ${activeSprint.endDate?.toDate?.()?.toLocaleDateString() || "N/A"}
        - Tickets: ${activeSprintTickets.length} total
          - To Do: ${
            activeSprintTickets.filter((t) => t.status === "todo").length
          }
          - In Progress: ${
            activeSprintTickets.filter(
              (t) => t.status === "in-progress" || t.status === "inProgress"
            ).length
          }
          - In Review: ${
            activeSprintTickets.filter((t) => t.status === "review").length
          }
          - Done: ${
            activeSprintTickets.filter((t) => t.status === "done").length
          }
        `
            : "No active sprint currently."
        }
        
        ${
          plannedSprints.length > 0
            ? `\n**Planned Sprints:** ${plannedSprints
                .map((s) => s.name)
                .join(", ")}`
            : ""
        }
        ${
          completedSprints.length > 0
            ? `\n**Recent Completed Sprints:** ${completedSprints
                .slice(0, 3)
                .map((s) => s.name)
                .join(", ")}`
            : ""
        }

        ### Current Tickets Overview
        - Total tickets: ${tickets.length}
        - To Do: ${ticketsByStatus.todo.length}
        - In Progress: ${ticketsByStatus.inProgress.length}
        - In Review: ${ticketsByStatus.review.length}
        - Done: ${ticketsByStatus.done.length}

        ${
          activeSprint && activeSprintTickets.length > 0
            ? `
        ### Active Sprint Tickets
        ${activeSprintTickets
          .slice(0, 10)
          .map((t) => {
            const assigneeName = t.assigneeId
              ? members.find((m) => m.userId === t.assigneeId)?.fullName ||
                `User ${t.assigneeId}`
              : "Unassigned";

            return `- [${t.status}] ${t.title || t.name} (${t.type})${
              assigneeName !== "Unassigned"
                ? ` - Assigned to: ${assigneeName}`
                : ""
            }`;
          })
          .join("\n")}
        ${
          activeSprintTickets.length > 10
            ? `\n... and ${
                activeSprintTickets.length - 10
              } more tickets in the sprint`
            : ""
        }
        `
            : ""
        }

        ${
          stories.length > 0
            ? `### Stories\n${stories
                .slice(0, 10)
                .map(
                  (s) =>
                    `- ${s.title || s.name} (${s.size || "?"} pts)${
                      s.assigneeId
                        ? ` [Assigned to: ${
                            members.find((m) => m.userId === s.assigneeId)
                              ?.fullName || `User ${s.assigneeId}`
                          }]`
                        : ""
                    }`
                )
                .join("\n")}${
                stories.length > 10
                  ? `\n... and ${stories.length - 10} more stories`
                  : ""
              }`
            : ""
        }

        ${
          bugs.length > 0
            ? `### Bugs\n${bugs
                .slice(0, 5)
                .map(
                  (b) =>
                    `- ${b.title || b.name} [${b.priority || "medium"}]${
                      b.assigneeId
                        ? ` [Assigned to: ${
                            members.find((m) => m.userId === b.assigneeId)
                              ?.fullName || `User ${b.assigneeId}`
                          }]`
                        : ""
                    }`
                )
                .join("\n")}${
                bugs.length > 5 ? `\n... and ${bugs.length - 5} more bugs` : ""
              }`
            : ""
        }

        ${
          tickets.length > 0 && !activeSprint
            ? `### Recent Tickets\n${tickets
                .slice(0, 5)
                .map(
                  (t) =>
                    `- ${t.title || t.name} [${t.status}]${
                      t.assigneeId
                        ? ` [Assigned to: ${
                            members.find((m) => m.userId === t.assigneeId)
                              ?.fullName || `User ${t.assigneeId}`
                          }]`
                        : ""
                    }`
                )
                .join("\n")}${
                tickets.length > 5
                  ? `\n... and ${tickets.length - 5} more tickets`
                  : ""
              }`
            : ""
        }

        ---

        ### User's Question
        "${prompt}"

        Provide a helpful and prioritized answer based on the context.
        ${
          preferredLanguage === "es"
            ? "Responde siempre en español."
            : "Always respond in English."
        }
        ${
          userNickname
            ? `${
                preferredLanguage === "es"
                  ? "Dirígete al usuario como"
                  : "Address the user as"
              } "${userNickname}" ${
                preferredLanguage === "es"
                  ? "de vez en cuando."
                  : "occasionally."
              }`
            : ""
        }
        ${
          verbosityLevel === "concise"
            ? preferredLanguage === "es"
              ? "Sé conciso y directo en tu respuesta, evita detalles innecesarios."
              : "Be concise and direct in your response, avoid unnecessary details."
            : verbosityLevel === "detailed"
            ? preferredLanguage === "es"
              ? "Proporciona respuestas detalladas con toda la información disponible."
              : "Provide detailed responses with all available information."
            : preferredLanguage === "es"
            ? "Proporciona una respuesta equilibrada con información relevante."
            : "Provide a balanced response with relevant information."
        }
        When discussing team members, acknowledge their roles.
        When discussing work items (stories, bugs, tickets), mention who they're assigned to if applicable.
        When discussing sprints, provide information about sprint progress, dates, and ticket distribution.
        When discussing tickets, include their status, assignees, and which sprint they belong to.
        If the user asks about sprint progress, workload, or ticket status, provide detailed information based on the sprint and ticket data.
        If the user asks about team responsibilities or who is working on what, provide that information based on the available data.
        ${
          aiConfig.enableAiSuggestions
            ? preferredLanguage === "es"
              ? "Cuando sea apropiado, ofrece sugerencias proactivas basadas en el contexto del proyecto."
              : "When appropriate, offer proactive suggestions based on the project context."
            : ""
        }
        `.trim();

    console.log("🧠 Prompt contextual construido con caché");

    // Call Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const body = {
      contents: [
        {
          parts: [{ text: contextPrompt }],
        },
      ],
      generationConfig: {
        temperature: aiConfig.enableAiSuggestions ? 0.3 : 0.2, // Temperatura mas alta para sugerencias
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
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
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("✅ Respuesta recibida de Gemini");

      if (reply) {
        // Agregar respuesta a la conversación
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
          cacheHit: cachedData.lastUpdated > Date.now() - 300000, // Checar si el caché fue usado
        });
      } else {
        // Respuesta de emergencia
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
