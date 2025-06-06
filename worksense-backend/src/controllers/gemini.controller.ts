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

    // Fetch gamification data
    const userGamificationData = await getUserGamificationData(userId);
    const projectLeaderboard = await getProjectLeaderboard(projectId);
    const recentActivity = await getProjectActivity(projectId, 5);
    const gamificationStats = await getProjectGamificationStats(projectId);

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

    // Build gamification context
    const userRankInProject =
      projectLeaderboard.find((user) => user.userId === userId)?.rank ||
      "Not ranked";
    const topThreeLeaders = projectLeaderboard.slice(0, 3);

    // Construir el prompt de contexto para Gemini con gamificación Y backlog detallado
    const contextPrompt = `
You are Sensai, a comprehensive project management assistant with expertise in both traditional project management (backlog, sprints, tasks) and gamification features. You help teams manage their work and stay motivated.

### GUIDELINES:
- Answer ALL questions about project management, backlog items, sprints, tasks, team members, AND gamification
- Provide detailed information about backlog items, including who they're assigned to
- Include gamification context when relevant (points, badges, leaderboards)
- Keep responses informative yet engaging
- Use markdown formatting and appropriate emojis for clarity

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
${
  currentMember?.projectRoleId &&
  rolePermissionDescriptions[currentMember.projectRoleId]
    ? `- **Permissions**: ${rolePermissionDescriptions[
        currentMember.projectRoleId
      ]
        .slice(0, 3)
        .join(", ")}${
        rolePermissionDescriptions[currentMember.projectRoleId].length > 3
          ? ` and ${
              rolePermissionDescriptions[currentMember.projectRoleId].length - 3
            } more`
          : ""
      }`
    : ""
}
${userNickname ? `- **Preferred Name**: "${userNickname}"` : ""}

### Your Gamification Status 🎮
${
  userGamificationData
    ? `
- **🏆 Total Points**: ${userGamificationData.total_points}
- **📊 Level**: ${userGamificationData.level}
- **🥇 Project Rank**: #${userRankInProject} ${
        typeof userRankInProject === "number" && userRankInProject <= 3
          ? "🔥"
          : ""
      }
- **🎖️ Badges Earned**: ${userGamificationData.badges.length}
${
  userGamificationData.badges.length > 0
    ? `- **Recent Badges**: ${userGamificationData.badges
        .slice(-3)
        .map((b: any) => `${b.icon} ${b.name}`)
        .join(", ")}`
    : ""
}
`
    : "- Gamification data not available"
}

### Recent Context
${conversationHistory || "First interaction in this session."}

### Project Overview
**${projectData.name || "Project"}** | Status: ${projectData.status || "active"}
${projectData.description ? `${projectData.description}` : ""}
${
  projectData.context?.techStack
    ? `**Tech Stack**: ${projectData.context.techStack.join(", ")}`
    : ""
}
${
  projectData.context?.objectives
    ? `**Objectives**: ${projectData.context.objectives}`
    : ""
}

### Team Members and Roles (${enrichedMembers.length} members)
${
  enrichedMembers.length > 0
    ? enrichedMembers
        .map((m) => {
          const memberName = m.fullName || m.name || `User ${m.userId}`;
          const roleName = m.roleName || m.projectRoleId || "Unknown Role";
          const email = m.email ? ` (${m.email})` : "";
          const memberRank = projectLeaderboard.find(
            (user) => user.userId === m.userId
          )?.rank;
          const rankDisplay = memberRank ? ` - Rank #${memberRank}` : "";

          let memberInfo = `- **${memberName}**: ${roleName}${email}${rankDisplay}`;

          // Add permissions if available
          if (m.projectRoleId && rolePermissionDescriptions[m.projectRoleId]) {
            const permissions = rolePermissionDescriptions[m.projectRoleId];
            if (permissions.length > 0) {
              memberInfo += `\n  Permissions: ${permissions
                .slice(0, 3)
                .join(", ")}${
                permissions.length > 3
                  ? ` and ${permissions.length - 3} more`
                  : ""
              }`;
            }
          }

          return memberInfo;
        })
        .join("\n")
    : "No team members found."
}

### Current Sprint Status
${
  activeSprint
    ? `**🏃 Active Sprint**: ${activeSprint.name}
- **Goal**: ${activeSprint.goal || "No goal set"}
- **Timeline**: ${
        activeSprint.startDate?.toDate?.()?.toLocaleDateString() || "N/A"
      } → ${activeSprint.endDate?.toDate?.()?.toLocaleDateString() || "N/A"}
- **Tasks**: ${activeSprintTasks.length} total
  - Todo: ${activeSprintTasks.filter((t) => t.status === "todo").length}
  - In Progress: ${
    activeSprintTasks.filter(
      (t) => t.status === "in-progress" || t.status === "inProgress"
    ).length
  }
  - Review: ${activeSprintTasks.filter((t) => t.status === "review").length}
  - Done: ${activeSprintTasks.filter((t) => t.status === "done").length}

### Active Sprint Tasks
${activeSprintTasks
  .slice(0, 10)
  .map((t) => {
    const assigneeNames =
      t.assignees
        ?.map(
          (a: any) =>
            enrichedMembers.find((m) => m.userId === a.id)?.fullName ||
            a.name ||
            `User ${a.id}`
        )
        .join(", ") || "Unassigned";

    return `- [${t.status}] **${t.title}** (${t.type})${
      assigneeNames !== "Unassigned" ? ` - Assigned to: ${assigneeNames}` : ""
    }`;
  })
  .join("\n")}
${
  activeSprintTasks.length > 10
    ? `... and ${activeSprintTasks.length - 10} more tasks in the sprint`
    : ""
}`
    : "**No active sprint currently running**"
}

${
  plannedSprints.length > 0
    ? `\n**Planned Sprints**: ${plannedSprints.map((s) => s.name).join(", ")}`
    : ""
}
${
  completedSprints.length > 0
    ? `\n**Recent Completed Sprints**: ${completedSprints
        .slice(0, 3)
        .map((s) => s.name)
        .join(", ")}`
    : ""
}

### Backlog Summary
- **📋 Total Items**: ${backlogItems.length}
- **📑 Epics**: ${epics.length}
- **📖 Stories**: ${stories.length} 
- **🐛 Bugs**: ${bugs.length}
- **🔧 Tech Tasks**: ${techTasks.length}
- **📚 Knowledge Items**: ${knowledgeItems.length}

${
  epics.length > 0
    ? `### Epics
${epics
  .map(
    (e) =>
      `- **${e.name}** (${e.status || "unknown"})${
        e.assigneeId
          ? ` [Assigned to: ${
              enrichedMembers.find((m) => m.userId === e.assigneeId)
                ?.fullName || `User ${e.assigneeId}`
            }]`
          : " [Unassigned]"
      }`
  )
  .join("\n")}`
    : ""
}

${
  stories.length > 0
    ? `### User Stories
${stories
  .slice(0, 15)
  .map(
    (s) =>
      `- **${s.name}** (${s.size || "?"} pts, ${s.status || "todo"})${
        s.assigneeId
          ? ` [Assigned to: ${
              enrichedMembers.find((m) => m.userId === s.assigneeId)
                ?.fullName || `User ${s.assigneeId}`
            }]`
          : " [Unassigned]"
      }`
  )
  .join("\n")}${
        stories.length > 15
          ? `\n... and ${stories.length - 15} more stories`
          : ""
      }`
    : ""
}

${
  bugs.length > 0
    ? `### Bugs
${bugs
  .slice(0, 10)
  .map(
    (b) =>
      `- **${b.name}** [Priority: ${b.size || "medium"}, Status: ${
        b.status || "todo"
      }]${
        b.assigneeId
          ? ` [Assigned to: ${
              enrichedMembers.find((m) => m.userId === b.assigneeId)
                ?.fullName || `User ${b.assigneeId}`
            }]`
          : " [Unassigned]"
      }`
  )
  .join("\n")}${
        bugs.length > 10 ? `\n... and ${bugs.length - 10} more bugs` : ""
      }`
    : ""
}

${
  techTasks.length > 0
    ? `### Technical Tasks
${techTasks
  .slice(0, 10)
  .map(
    (t) =>
      `- **${t.name}** (${t.status || "todo"})${
        t.assigneeId
          ? ` [Assigned to: ${
              enrichedMembers.find((m) => m.userId === t.assigneeId)
                ?.fullName || `User ${t.assigneeId}`
            }]`
          : " [Unassigned]"
      }`
  )
  .join("\n")}${
        techTasks.length > 10
          ? `\n... and ${techTasks.length - 10} more tech tasks`
          : ""
      }`
    : ""
}

### Current Tasks Overview
- **Total Tasks**: ${tasks.length}
- **📝 To Do**: ${tasksByStatus.todo.length}
- **🔄 In Progress**: ${tasksByStatus.inProgress.length}
- **👀 In Review**: ${tasksByStatus.review.length}
- **✅ Done**: ${tasksByStatus.done.length}

### Gamification Overview
${
  topThreeLeaders.length > 0
    ? `**🏆 Top Performers:**
${topThreeLeaders
  .map((user, index) => {
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
    return `${medal} **${user.name}**: ${user.points} points`;
  })
  .join("\n")}`
    : ""
}

${
  recentActivity.length > 0
    ? `**🎯 Recent Activity:**
${recentActivity
  .slice(0, 3)
  .map((activity: any) => {
    if (activity.type === "badge_earned") {
      return `- 🎖️ **${activity.user}** earned "${activity.data.badgeName}" badge`;
    } else {
      return `- ✅ **${activity.user}** completed "${activity.data.itemTitle}" (+${activity.data.points} points)`;
    }
  })
  .join("\n")}`
    : ""
}

${
  gamificationStats
    ? `**📊 Project Stats:**
- **Completion Rate**: ${gamificationStats.completionRate}%
- **Total Points Earned**: ${gamificationStats.totalPoints}
- **Average Points per Person**: ${gamificationStats.averagePoints}`
    : ""
}

### User Question
"${prompt}"

### Response Instructions
${preferredLanguage === "es" ? "Responde en español." : "Respond in English."}
${userNickname ? `Address the user as "${userNickname}" occasionally.` : ""}

When discussing:
- **Backlog items**: Always mention who they're assigned to, their status, and any relevant details
- **Team members**: Include their roles, permissions, and gamification rank when relevant
- **Sprints**: Provide detailed information about progress, dates, and task distribution
- **Tasks**: Include status, assignees, sprint association, and points when applicable
- **Gamification**: Integrate points, badges, and leaderboard info naturally when it adds value

${
  verbosityLevel === "concise"
    ? "Keep your response concise and focused on key information."
    : verbosityLevel === "detailed"
    ? "Provide comprehensive responses with all available details."
    : "Provide balanced responses with relevant information."
}

Use markdown formatting for clarity:
- **Bold** for important items and names
- Bullet points for lists
- Emojis sparingly for visual appeal (🎯, 📋, ✅, etc.)
- Headers (##) for major sections when needed

If the question is not project-related, politely redirect: "${
      preferredLanguage === "es"
        ? "Solo puedo ayudarte con temas del proyecto, backlog, tareas y gamificación. ¿En qué aspecto específico del proyecto puedo asistirte?"
        : "I can only help with project, backlog, tasks, and gamification topics. What specific aspect of the project can I assist you with?"
    }"
`.trim();

    // Llamada a la API de Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const body = {
      contents: [
        {
          parts: [{ text: contextPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
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

        res.json({
          reply,
          timestamp: new Date().toISOString(),
          conversation: {
            id: conversation.id,
            metadata: conversation.metadata,
          },
          gamificationData: {
            userStats: userGamificationData,
            userRank: userRankInProject,
            leaderboard: topThreeLeaders,
            recentActivity: recentActivity.slice(0, 3),
            projectStats: gamificationStats,
          },
          cacheHit: cachedData.lastUpdated > Date.now() - 300000,
          hasMarkdown:
            reply.includes("**") ||
            reply.includes("##") ||
            reply.includes("`") ||
            reply.includes("-"),
        });
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
