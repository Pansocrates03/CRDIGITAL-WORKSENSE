import { Request, Response, NextFunction, RequestHandler } from "express";
import { sqlConnect, sql } from "../models/sqlModel.js";
import { db } from "../models/firebase.js";
import { calculateTaskPoints } from "../service/gamificationService.js";

/**
 * Get user's gamification data (points, level, badges)
 * @route GET /api/v1/gamification/user/:userId
 */
export const getUserGamificationData: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const pool = await sqlConnect();
    if (!pool) {
      return res.status(500).json({ message: "Database connection failed" });
    }

    const result = await pool
      .request()
      .input("UserId", sql.Int, parseInt(userId))
      .query("SELECT * FROM user_gamification WHERE user_id = @UserId");

    if (result.recordset.length === 0) {
      // Create initial record if doesn't exist
      await pool.request().input("UserId", sql.Int, parseInt(userId)).query(`
          INSERT INTO user_gamification (user_id, total_points, level, badges)
          VALUES (@UserId, 0, 1, '[]')
        `);

      return res.json({
        user_id: parseInt(userId),
        total_points: 0,
        level: 1,
        badges: [],
      });
    }

    const userData = result.recordset[0];
    res.json({
      ...userData,
      badges: JSON.parse(userData.badges || "[]"),
    });
  } catch (error) {
    console.error("Error fetching user gamification data:", error);
    next(error);
  }
};

/**
 * Get recent project activity (task completions, badge earnings, etc.)
 * @route GET /api/v1/projects/:projectId/gamification/activity
 */
export const getProjectActivity: RequestHandler = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const activities = [];

    // Get recent task completions from backlog items
    const backlogSnap = await db
      .collection("projects")
      .doc(projectId)
      .collection("backlog")
      .where("status", "in", ["done", "Done", "DONE", "done"])
      .orderBy("updatedAt", "desc")
      .limit(limit)
      .get();

    // Get recent badge earnings from Firebase
    const leaderboardSnap = await db
      .collection("projects")
      .doc(projectId)
      .collection("gamification")
      .doc("leaderboard")
      .get();

    const leaderboardData = leaderboardSnap.data() || {};

    // Get user names from SQL
    const pool = await sqlConnect();
    const userIds = Object.keys(leaderboardData).map((id) => parseInt(id));
    const userNames: Record<number, string> = {};

    if (pool && userIds.length > 0) {
      const userIdsString = userIds.join(",");
      const result = await pool
        .request()
        .input("UserIds", sql.NVarChar(sql.MAX), userIdsString)
        .execute("spGetUsersByIds");

      if (result.recordset && result.recordset.length > 0) {
        result.recordset.forEach((user: any) => {
          userNames[user.id] = `${user.firstName} ${user.lastName}`;
        });
      }
    }

    // Process badge earnings
    Object.entries(leaderboardData).forEach(
      ([userId, userData]: [string, any]) => {
        const badges = userData.badges || [];
        badges.forEach((badge: any) => {
          activities.push({
            type: "badge_earned",
            timestamp: badge.earnedAt?.toDate() || new Date(),
            user: userNames[parseInt(userId)] || "Unknown User",
            userId: parseInt(userId),
            data: {
              badgeName: badge.name,
              badgeIcon: badge.icon,
            },
          });
        });
      }
    );

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

    res.json(activities.slice(0, limit));
  } catch (error) {
    console.error("Error fetching project activity:", error);
    next(error);
  }
};

/**
 * Get project leaderboard
 * @route GET /api/v1/projects/:projectId/gamification/leaderboard
 */
export const getProjectLeaderboard: RequestHandler = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Get leaderboard data from Firebase
    const leaderboardSnap = await db
      .collection("projects")
      .doc(projectId)
      .collection("gamification")
      .doc("leaderboard")
      .get();

    const leaderboardData: Record<string, any> = leaderboardSnap.data() || {};
    if (Object.keys(leaderboardData).length === 0) {
      return res.json([]);
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

    // Build leaderboard with avatarUrl
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

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching project leaderboard:", error);
    next(error);
  }
};

/**
 * Get gamification stats for a project
 * @route GET /api/v1/projects/:projectId/gamification/stats
 */
// Update your existing getProjectGamificationStats function
export const getProjectGamificationStats: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { projectId } = req.params;

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

    const stats = {
      // Gamification stats
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

      // Project stats
      totalBacklogItems: backlogItems.length,
      completedTasks: backlogItems.filter((item: any) => item.status === "done")
        .length,
      inProgressTasks: backlogItems.filter(
        (item: any) => item.status === "in-progress"
      ).length,
      todoTasks: backlogItems.filter(
        (item: any) => item.status === "todo" || !item.status
      ).length,

      // Calculate completion rate
      get completionRate() {
        return this.totalBacklogItems > 0
          ? Math.round((this.completedTasks / this.totalBacklogItems) * 100)
          : 0;
      },

      // Item type breakdown
      epics: backlogItems.filter((item: any) => item.type === "epic").length,
      stories: backlogItems.filter((item: any) => item.type === "story").length,
      bugs: backlogItems.filter((item: any) => item.type === "bug").length,
      techTasks: backlogItems.filter((item: any) => item.type === "techTask")
        .length,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching project stats:", error);
    next(error);
  }
};
