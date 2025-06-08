import { Request, Response } from "express";
import { sqlConnect, sql } from "../models/sqlModel.js";
import { Timestamp } from "firebase-admin/firestore";
import { projectCacheService } from "../service/projectCache.service.js";
import { calculateTaskPoints } from "../service/gamificationService.js";
import { db } from "../models/firebase.js";
import {
  getOrCreateConversation,
  addMessageToConversation,
  getConversationHistory,
  extractUserPreferences,
} from "../controllers/conversation.controller.js";

// Estar al tanto de las suscripciones activas para evitar fugas de memoria
const activeSubscriptions = new Map<string, () => void>();

// Enhanced function to check if question is project-related (now includes gamification)
const isProjectRelatedQuestion = (prompt: string): boolean => {
  const projectKeywords = [
    // Original project keywords
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
    "assigned",
    "working on",
    "responsible",
    "tech task",
    "knowledge",
    "item",
    "todo",
    "in progress",
    "review",
    "done",

    // Gamification keywords
    "points",
    "score",
    "level",
    "badge",
    "leaderboard",
    "ranking",
    "achievement",
    "gamification",
    "activity",
    "performance",
    "top performer",
    "completion rate",
    "earned",
    "reward",

    // Equivalentes en español
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
    "puntos",
    "puntaje",
    "nivel",
    "insignia",
    "clasificación",
    "logro",
    "gamificación",
    "actividad",
    "rendimiento",
    "recompensa",
    "asignado",
    "trabajando",

    // Palabras clave de acción
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

    // Preguntas comunes relacionadas con proyectos y gamificación
    "who is working",
    "what is pending",
    "when is due",
    "how many",
    "who has the most",
    "my points",
    "my level",
    "my badges",
    "team ranking",
    "quién está trabajando",
    "qué está pendiente",
    "cuándo vence",
    "cuántos",
    "quién tiene más",
    "mis puntos",
    "mi nivel",
    "mis insignias",
    "clasificación del equipo",
    "what needs to be done",
    "qué necesita hacerse",
    "pending items",
    "elementos pendientes",
  ];

  const lowerPrompt = prompt.toLowerCase();

  // Checar si el prompt contiene palabras clave del proyecto
  const hasProjectKeywords = projectKeywords.some((keyword) =>
    lowerPrompt.includes(keyword.toLowerCase())
  );

  // Buscar indicadores claros de que no es un tema del proyecto
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

  // Si tiene indicadores claros de no proyecto y no tiene palabras clave de proyecto, es probable que no sea relevante
  if (hasNonProjectIndicators && !hasProjectKeywords) {
    return false;
  }

  // Si tiene palabras clave de proyecto, es relevante
  if (hasProjectKeywords) {
    return true;
  }

  // Para casos ambiguos - ser más permisivo con preguntas del backlog
  return true;
};

// Function to check if question is specifically about gamification
const isGamificationQuestion = (prompt: string): boolean => {
  const gamificationKeywords = [
    "points",
    "score",
    "level",
    "badge",
    "leaderboard",
    "ranking",
    "achievement",
    "gamification",
    "top performer",
    "completion rate",
    "earned",
    "reward",
    "my points",
    "my level",
    "my badges",
    "team ranking",
    "puntos",
    "puntaje",
    "nivel",
    "insignia",
    "clasificación",
    "logro",
    "gamificación",
    "rendimiento",
    "recompensa",
    "mis puntos",
    "mi nivel",
    "mis insignias",
    "clasificación del equipo",
  ];

  const lowerPrompt = prompt.toLowerCase();
  return gamificationKeywords.some((keyword) =>
    lowerPrompt.includes(keyword.toLowerCase())
  );
};

// Helper function to fetch gamification data for a user
const getUserGamificationData = async (userId: number) => {
  try {
    const pool = await sqlConnect();
    if (!pool) return null;

    const result = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .query("SELECT * FROM user_gamification WHERE user_id = @UserId");

    if (result.recordset.length === 0) {
      return {
        user_id: userId,
        total_points: 0,
        level: 1,
        badges: [],
      };
    }

    const userData = result.recordset[0];
    return {
      ...userData,
      badges: JSON.parse(userData.badges || "[]"),
    };
  } catch (error) {
    console.error("Error fetching user gamification data:", error);
    return null;
  }
};

// Helper function to fetch project leaderboard
const getProjectLeaderboard = async (projectId: string) => {
  try {
    const leaderboardSnap = await db
      .collection("projects")
      .doc(projectId)
      .collection("gamification")
      .doc("leaderboard")
      .get();

    const leaderboardData: Record<string, any> = leaderboardSnap.data() || {};
    if (Object.keys(leaderboardData).length === 0) {
      return [];
    }

    // Get all userIds from the leaderboard
    const userIds = Object.keys(leaderboardData).map((id) => parseInt(id, 10));

    // Fetch user profiles from SQL
    const userProfiles: Record<number, string | null> = {};
    try {
      const pool = await sqlConnect();
      if (pool && userIds.length > 0) {
        const userIdsString = userIds.join(",");
        const result = await pool
          .request()
          .input("UserIds", sql.NVarChar(sql.MAX), userIdsString)
          .execute("spGetUsersByIds");
        if (result.recordset && result.recordset.length > 0) {
          result.recordset.forEach((user: any) => {
            userProfiles[user.id] = user.pfp;
          });
        }
      }
    } catch (sqlError) {
      console.error("Error fetching user avatars from SQL:", sqlError);
    }

    // Build leaderboard
    const leaderboard = Object.entries(leaderboardData)
      .map(([userId, userData]: [string, any]) => ({
        userId: parseInt(userId),
        points: userData.points || 0,
        name: userData.name || "Unknown User",
        avatarUrl:
          userProfiles[parseInt(userId)] ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            userData.name || "User"
          )}&background=AC1754&color=FFFFFF`,
        role: userData.role || null,
        lastUpdate: userData.lastUpdate,
      }))
      .sort((a, b) => b.points - a.points)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    return leaderboard;
  } catch (error) {
    console.error("Error fetching project leaderboard:", error);
    return [];
  }
};

// Helper function to fetch recent project activity
const getProjectActivity = async (projectId: string, limit: number = 5) => {
  try {
    const activities: Array<{
      type: "badge_earned" | "task_completion";
      timestamp: Date;
      user: string;
      userId: number;
      data: {
        badgeName?: string;
        badgeIcon?: string;
        itemTitle?: string;
        itemId?: string;
        itemType?: string;
        points?: number;
      };
    }> = [];

    // Get recent task completions from backlog items
    const backlogSnap = await db
      .collection("projects")
      .doc(projectId)
      .collection("backlog")
      .where("status", "==", "done")
      .orderBy("updatedAt", "desc")
      .limit(limit)
      .get();

    // Get recent badge earnings from SQL
    const pool = await sqlConnect();
    if (pool) {
      const badgeQuery = await pool
        .request()
        .input("Limit", sql.Int, limit)
        .input("ProjectId", sql.NVarChar, projectId).query(`
          SELECT TOP (@Limit)
            ug.user_id,
            badge_data.badge_name,
            badge_data.badge_icon,
            badge_data.earned_at,
            badge_data.project_id,
            u.firstName + ' ' + u.lastName as user_name
          FROM user_gamification ug
          CROSS APPLY (
            SELECT 
              JSON_VALUE(badge.value, '$.name') as badge_name,
              JSON_VALUE(badge.value, '$.icon') as badge_icon,
              JSON_VALUE(badge.value, '$.earnedAt') as earned_at,
              JSON_VALUE(badge.value, '$.projectId') as project_id
            FROM OPENJSON(ug.badges) badge
            WHERE JSON_VALUE(badge.value, '$.earnedAt') IS NOT NULL
          ) badge_data
          JOIN users u ON u.id = ug.user_id
          WHERE badge_data.project_id = @ProjectId
          ORDER BY badge_data.earned_at DESC
        `);

      // Add badge earnings to activities
      badgeQuery.recordset.forEach((badge) => {
        activities.push({
          type: "badge_earned",
          timestamp: new Date(badge.earned_at),
          user: badge.user_name,
          userId: badge.user_id,
          data: {
            badgeName: badge.badge_name,
            badgeIcon: badge.badge_icon,
          },
        });
      });
    }

    // Add task completions to activities
    backlogSnap.docs.forEach((doc) => {
      const item = doc.data();
      activities.push({
        type: "task_completion",
        timestamp: item.updatedAt?.toDate() || new Date(),
        user: item.assigneeName || "Someone",
        userId: item.assigneeId,
        data: {
          itemTitle: item.name,
          itemId: doc.id,
          itemType: item.type,
          points: calculateTaskPoints(item),
        },
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return activities.slice(0, limit);
  } catch (error) {
    console.error("Error fetching project activity:", error);
    return [];
  }
};

// Helper function to get project gamification stats
const getProjectGamificationStats = async (projectId: string) => {
  try {
    // Get gamification leaderboard
    const leaderboardSnap = await db
      .collection("projects")
      .doc(projectId)
      .collection("gamification")
      .doc("leaderboard")
      .get();

    // Get project backlog items
    const backlogSnap = await db
      .collection("projects")
      .doc(projectId)
      .collection("backlog")
      .get();

    const leaderboardData = leaderboardSnap.data() || {};
    const users = Object.values(leaderboardData) as any[];
    const backlogItems = backlogSnap.docs.map((doc) => doc.data());

    return {
      totalUsers: users.length,
      totalPoints: users.reduce(
        (sum: number, user: any) => sum + (user.points || 0),
        0
      ),
      averagePoints:
        users.length > 0
          ? Math.round(
              users.reduce(
                (sum: number, user: any) => sum + (user.points || 0),
                0
              ) / users.length
            )
          : 0,
      topPerformer:
        users.length > 0
          ? users.reduce(
              (top: any, user: any) =>
                (user.points || 0) > (top.points || 0) ? user : top,
              users[0]
            )
          : null,
      totalBacklogItems: backlogItems.length,
      completedTasks: backlogItems.filter((item: any) => item.status === "done")
        .length,
      completionRate:
        backlogItems.length > 0
          ? Math.round(
              (backlogItems.filter((item: any) => item.status === "done")
                .length /
                backlogItems.length) *
                100
            )
          : 0,
    };
  } catch (error) {
    console.error("Error fetching project gamification stats:", error);
    return null;
  }
};

// Helper function to create role permission descriptions
const createRolePermissionDescriptions = (
  projectRoles: Map<string, any>,
  availablePermissions: Map<string, any>
): Record<string, string[]> => {
  const rolePermissionDescriptions: Record<string, string[]> = {};

  projectRoles.forEach((role) => {
    const permDescriptions: string[] = [];

    role.permissions.forEach((permKey: string) => {
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

  return rolePermissionDescriptions;
};

export const handleGeminiPrompt = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { prompt, projectId } = req.body;
  const userId = req.user?.userId || 1;

  if (!prompt || !projectId) {
    res.status(400).json({ message: "Missing prompt or projectId" });
    return;
  }

  try {
    // Checar si la pregunta está relacionada con el proyecto
    if (!isProjectRelatedQuestion(prompt)) {
      const userPreferences = await getOrCreateConversation(userId, projectId);
      const preferredLanguage =
        userPreferences.metadata?.userPreferences?.preferredLanguage || "en";

      const offTopicResponse =
        preferredLanguage === "es"
          ? "Lo siento, pero solo puedo ayudarte con preguntas relacionadas con tu proyecto, backlog, tareas y gamificación. ¿Hay algo específico sobre el proyecto o tu progreso en lo que pueda asistirte?"
          : "I'm sorry, but I can only help you with questions related to your project, backlog, tasks, and gamification. Is there something specific about the project or your progress I can assist you with?";

      res.json({
        reply: offTopicResponse,
        timestamp: new Date().toISOString(),
        isOffTopic: true,
      });
      return;
    }

    // Check if this is a gamification-specific question
    const isGamificationQuery = isGamificationQuestion(prompt);

    // Configuración del caché
    if (!activeSubscriptions.has(projectId)) {
      const unsubscribe =
        projectCacheService.subscribeToProjectUpdates(projectId);
      activeSubscriptions.set(projectId, unsubscribe);
    }

    // Obtener o crear la conversación para el usuario y proyecto
    const conversation = await getOrCreateConversation(userId, projectId);

    // Crear mensaje del usuario
    const userMessage = {
      role: "user" as const,
      content: prompt,
      timestamp: Timestamp.now(),
    };

    // Extraer preferencias del usuario del prompt
    const metadataUpdates = extractUserPreferences(prompt);

    await addMessageToConversation(
      conversation.id!,
      userMessage,
      metadataUpdates ?? undefined
    );

    // Obtener el historial reciente de la conversación
    const recentMessages = await getConversationHistory(conversation.id!, 10);

    // Obtener datos del proyecto desde el caché
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

    // Only fetch gamification data if specifically asked for
    let userGamificationData = null;
    let projectLeaderboard: any[] = [];
    let recentActivity: any[] = [];
    let gamificationStats = null;

    if (isGamificationQuery) {
      userGamificationData = await getUserGamificationData(userId);
      projectLeaderboard = await getProjectLeaderboard(projectId);
      recentActivity = await getProjectActivity(projectId, 5);
      gamificationStats = await getProjectGamificationStats(projectId);
    }

    // Configuración de IA desde el proyecto
    const aiConfig = {
      aiContext: projectData.aiContext || projectData.context?.objectives || "",
      aiTechStack:
        projectData.aiTechStack ||
        projectData.context?.techStack?.join(", ") ||
        "",
      enableAiSuggestions: projectData.enableAiSuggestions !== false,
    };

    // Enriquecer miembros con datos de SQL
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

    // Agrupar elementos del backlog por tipo
    const stories = backlogItems.filter((item) => item.type === "story");
    const bugs = backlogItems.filter((item) => item.type === "bug");
    const techTasks = backlogItems.filter((item) => item.type === "techTask");
    const knowledgeItems = backlogItems.filter(
      (item) => item.type === "knowledge"
    );
    const epics = backlogItems.filter((item) => item.type === "epic");

    // Fetch stories inside epics (subcollections) and merge with standalone stories
    const epicsWithSubItems = await Promise.all(
      epics.map(async (epic) => {
        try {
          const subItemsSnapshot = await db
            .collection("projects")
            .doc(projectId)
            .collection("backlog")
            .doc(epic.id)
            .collection("subitems")
            .get();

          const subItems = subItemsSnapshot.docs.map((subDoc) => ({
            id: subDoc.id,
            ...subDoc.data(),
            parentEpicId: epic.id, // Add reference to parent epic
            parentEpicName: epic.name,
          }));

          return {
            ...epic,
            subItems,
          };
        } catch (error) {
          console.error(`Error fetching subitems for epic ${epic.id}:`, error);
          return {
            ...epic,
            subItems: [],
          };
        }
      })
    );

    // Get all stories from epics subcollections
    const storiesFromEpics = epicsWithSubItems.flatMap(
      (epic) => epic.subItems || []
    );

    // Combine standalone stories with stories from epics
    const allStories = [...stories, ...storiesFromEpics];

    // Get all unique assignee IDs from all backlog items to fetch their names
    const allAssigneeIds = new Set<number>();
    [...backlogItems, ...storiesFromEpics].forEach((item: any) => {
      if (item.assigneeId) {
        // Convert to number if it's a string, ensure it's a valid number
        const assigneeIdNum = typeof item.assigneeId === "string" 
          ? parseInt(item.assigneeId, 10) 
          : typeof item.assigneeId === "number" 
          ? item.assigneeId 
          : null;
        
        if (assigneeIdNum && !isNaN(assigneeIdNum)) {
          allAssigneeIds.add(assigneeIdNum);
        }
      }
    });

    // Fetch names for all assignees
    let assigneeNames = new Map<number, string>();
    if (allAssigneeIds.size > 0) {
      try {
        const pool = await sqlConnect();
        if (pool) {
          const assigneeIdsArray = Array.from(allAssigneeIds);
          const assigneeIdsString = assigneeIdsArray.join(",");
          const result = await pool
            .request()
            .input("UserIds", sql.NVarChar(sql.MAX), assigneeIdsString)
            .execute("spGetUsersByIds");

          if (result.recordset && result.recordset.length > 0) {
            result.recordset.forEach((userData) => {
              assigneeNames.set(
                userData.id,
                `${userData.firstName} ${userData.lastName}`
              );
            });
          }
        }
      } catch (sqlError) {
        console.error("Error fetching assignee names from SQL:", sqlError);
      }
    }

    // Procesar sprints
    const activeSprint = sprints.find((s) => s.status === "Active");
    const plannedSprints = sprints.filter((s) => s.status === "Planned");
    const completedSprints = sprints.filter((s) => s.status === "Completed");

    // Agrupar tareas por estado
    const tasksByStatus = {
      todo: tasks.filter((t) => t.status === "todo"),
      inProgress: tasks.filter(
        (t) => t.status === "in-progress" || t.status === "inProgress"
      ),
      review: tasks.filter((t) => t.status === "review"),
      done: tasks.filter((t) => t.status === "done"),
    };

    // Si hay un sprint activo, filtrar las tareas asociadas
    const activeSprintTasks = activeSprint
      ? tasks.filter((t) => t.sprintId === activeSprint.id)
      : [];

    // Create role permission descriptions
    const rolePermissionDescriptions = createRolePermissionDescriptions(
      projectRoles,
      availablePermissions
    );

    // Obtener preferencias del usuario actual
    const currentMember = enrichedMembers.find((m) => m.userId === userId);
    const userPreferences = conversation.metadata?.userPreferences || {};
    const userNickname = userPreferences.nickname;
    const preferredLanguage = userPreferences.preferredLanguage || "en";
    const verbosityLevel =
      conversation.metadata?.assistantSettings?.verbosityLevel || "normal";

    // Construir el historial de conversación reciente
    const conversationHistory = recentMessages
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n\n");

    // Detectar el idioma del mensaje del usuario
    const messageLanguage = detectLanguage(prompt);

    // Build simplified context prompt - only include gamification if specifically asked
    let contextPrompt = `
You are Sensai, a project management assistant. Answer questions about the project concisely and directly.

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

### Project: ${projectData.name || "Project"}
${projectData.description ? `${projectData.description}` : ""}

### Team Members (${enrichedMembers.length})
${
  enrichedMembers.length > 0
    ? enrichedMembers
        .map((m) => {
          const memberName = m.fullName || m.name || `User ${m.userId}`;
          const roleName = m.roleName || "Unknown Role";
          return `- **${memberName}**: ${roleName}`;
        })
        .join("\n")
    : "No team members found."
}

### Epics and Their Stories (${epics.length} epics, ${
      allStories.length
    } total stories)
${
  epicsWithSubItems.length > 0
    ? epicsWithSubItems
        .map((epic) => {
          let epicDisplay = `- **${epic.name}** (${epic.status || "unknown"})${
            epic.assigneeId
              ? ` [Assigned to: ${
                  assigneeNames.get(
                    typeof epic.assigneeId === "string" 
                      ? parseInt(epic.assigneeId, 10) 
                      : epic.assigneeId
                  ) ||
                  enrichedMembers.find((m) => m.userId === epic.assigneeId)
                    ?.fullName ||
                  `User ${epic.assigneeId}`
                }]`
              : " [Unassigned]"
          }`;

          // Add stories under this epic (from subcollection)
          if (epic.subItems && epic.subItems.length > 0) {
            epicDisplay += `\n  Stories (${epic.subItems.length}):`;
            epic.subItems.slice(0, 10).forEach((story: any) => {
              epicDisplay += `\n    - **${story.name}** (${
                story.size || "?"
              } pts, ${story.status || "todo"})${
                story.assigneeId
                  ? ` [Assigned to: ${
                      assigneeNames.get(
                        typeof story.assigneeId === "string" 
                          ? parseInt(story.assigneeId, 10) 
                          : story.assigneeId
                      ) ||
                      enrichedMembers.find((m) => m.userId === story.assigneeId)
                        ?.fullName ||
                      `User ${story.assigneeId}`
                    }]`
                  : " [Unassigned]"
              }`;
            });
            if (epic.subItems.length > 10) {
              epicDisplay += `\n    ... and ${
                epic.subItems.length - 10
              } more stories`;
            }
          } else {
            epicDisplay += `\n  Stories (0): No stories assigned to this epic yet`;
          }

          return epicDisplay;
        })
        .join("\n")
    : "No epics found."
}

### Standalone Stories (${stories.length})
${
  stories.length > 0
    ? stories
        .slice(0, 15)
        .map(
          (s) =>
            `- **${s.name}** (${s.size || "?"} pts, ${s.status || "todo"})${
              s.assigneeId
                ? ` [Assigned to: ${
                    assigneeNames.get(
                      typeof s.assigneeId === "string" 
                        ? parseInt(s.assigneeId, 10) 
                        : s.assigneeId
                    ) ||
                    enrichedMembers.find((m) => m.userId === s.assigneeId)
                      ?.fullName ||
                    `User ${s.assigneeId}`
                  }]`
                : " [Unassigned]"
            }`
        )
        .join("\n")
    : "No standalone stories found."
}

### Bugs (${bugs.length})
${
  bugs.length > 0
    ? bugs
        .slice(0, 15)
        .map(
          (b) =>
            `- **${b.name}** [Priority: ${b.size || "medium"}, Status: ${
              b.status || "todo"
            }]${
              b.assigneeId
                ? ` [Assigned to: ${
                    assigneeNames.get(
                      typeof b.assigneeId === "string" 
                        ? parseInt(b.assigneeId, 10) 
                        : b.assigneeId
                    ) ||
                    enrichedMembers.find((m) => m.userId === b.assigneeId)
                      ?.fullName ||
                    `User ${b.assigneeId}`
                  }]`
                : " [Unassigned]"
            }`
        )
        .join("\n")
    : "No bugs found."
}

### Technical Tasks (${techTasks.length})
${
  techTasks.length > 0
    ? techTasks
        .slice(0, 15)
        .map(
          (t) =>
            `- **${t.name}** (${t.status || "todo"})${
              t.assigneeId
                ? ` [Assigned to: ${
                    assigneeNames.get(
                      typeof t.assigneeId === "string" 
                        ? parseInt(t.assigneeId, 10) 
                        : t.assigneeId
                    ) ||
                    enrichedMembers.find((m) => m.userId === t.assigneeId)
                      ?.fullName ||
                    `User ${t.assigneeId}`
                  }]`
                : " [Unassigned]"
            }`
        )
        .join("\n")
    : "No tech tasks found."
}

### Current Sprint
${
  activeSprint
    ? `**Active Sprint**: ${activeSprint.name}
- **Goal**: ${activeSprint.goal || "No goal set"}
- **Tasks**: ${activeSprintTasks.length} total (${
        activeSprintTasks.filter((t) => t.status === "todo").length
      } todo, ${
        activeSprintTasks.filter(
          (t) => t.status === "in-progress" || t.status === "inProgress"
        ).length
      } in progress, ${
        activeSprintTasks.filter((t) => t.status === "review").length
      } review, ${
        activeSprintTasks.filter((t) => t.status === "done").length
      } done)`
    : "No active sprint"
}

### Tasks Overview
- **Total**: ${tasks.length} tasks
- **Todo**: ${tasksByStatus.todo.length}
- **In Progress**: ${tasksByStatus.inProgress.length}
- **Review**: ${tasksByStatus.review.length}
- **Done**: ${tasksByStatus.done.length}`;

    // Only add gamification section if this is a gamification question
    if (isGamificationQuery && userGamificationData) {
      const userRankInProject =
        projectLeaderboard.find((user) => user.userId === userId)?.rank ||
        "Not ranked";
      const topThreeLeaders = projectLeaderboard.slice(0, 3);

      contextPrompt += `

### Your Gamification Status 🎮
- **Points**: ${userGamificationData.total_points}
- **Level**: ${userGamificationData.level}
- **Project Rank**: #${userRankInProject}
- **Badges**: ${userGamificationData.badges.length}

### Leaderboard
${
  topThreeLeaders.length > 0
    ? topThreeLeaders
        .map((user, index) => {
          const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
          return `${medal} **${user.name}**: ${user.points} points`;
        })
        .join("\n")
    : "No leaderboard data available"
}

### Recent Activity
${
  recentActivity.length > 0
    ? recentActivity
        .slice(0, 3)
        .map((activity: any) => {
          if (activity.type === "badge_earned") {
            return `- 🎖️ **${activity.user}** earned "${activity.data.badgeName}" badge`;
          } else {
            return `- ✅ **${activity.user}** completed "${activity.data.itemTitle}" (+${activity.data.points} points)`;
          }
        })
        .join("\n")
    : "No recent activity"
}`;
    }

    contextPrompt += `

### User Question
"${prompt}"

### Instructions
${preferredLanguage === "es" ? "Responde en español." : "Respond in English."}
- Be concise and direct
- Only answer what was specifically asked
- Don't include gamification information unless the question is about gamification
- Use simple formatting (**bold** for names/items)
- When discussing epics, include their child stories from subcollections
- When discussing stories, mention if they belong to an epic (parentEpicName)
- Show epic-story hierarchical relationships clearly
- Focus on the specific information requested
${userNickname ? `- Address the user as "${userNickname}" occasionally` : ""}`;

    // Llamada a la API de Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const body = {
      contents: [
        {
          parts: [{ text: contextPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
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
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(
          `Gemini API error: ${errJson.error?.message || "Unknown error"}`
        );
      }

      const data = await response.json();
      let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (reply) {
        reply = reply.trim();

        // Agregar el mensaje del asistente a la conversación
        const assistantMessage = {
          role: "assistant" as const,
          content: reply,
          timestamp: Timestamp.now(),
        };

        await addMessageToConversation(conversation.id!, assistantMessage);

        const responseData: any = {
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
        };

        // Only include gamification data in response if it was specifically requested
        if (isGamificationQuery) {
          responseData.gamificationData = {
            userStats: userGamificationData,
            userRank:
              projectLeaderboard.find((user) => user.userId === userId)?.rank ||
              "Not ranked",
            leaderboard: projectLeaderboard.slice(0, 3),
            recentActivity: recentActivity.slice(0, 3),
            projectStats: gamificationStats,
          };
        }

        res.json(responseData);
      } else {
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
    res.status(500).json({
      message: "Error interno del servidor",
      error:
        typeof err === "object" && err !== null && "message" in err
          ? (err as any).message
          : String(err),
    });
  }
};

// Función de limpieza de suscripciones activas
export const cleanupSubscriptions = () => {
  activeSubscriptions.forEach((unsubscribe, projectId) => {
    unsubscribe();
  });
  activeSubscriptions.clear();
  projectCacheService.clearCache();
};

// Detectar el idioma del texto
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
    "puntos",
    "nivel",
    "insignias",
    "clasificación",
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
