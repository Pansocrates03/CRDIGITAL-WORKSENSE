import { sqlConnect, sql } from "../models/sqlModel.js";
import { db } from "../models/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

interface AwardPointsParams {
  userId: number;
  projectId: string;
  action: string;
  taskType?: string;
  points: number;
  userName?: string;
  userRole?: string;
}

interface Badge {
  name: string;
  points: number;
  icon: string;
  earnedAt?: Date;
  projectId: string;
}

export const awardPoints = async (params: AwardPointsParams) => {
  const { userId, projectId, action, points, userName, userRole } = params;

  try {
    const pool = await sqlConnect();
    if (!pool) throw new Error("Database connection failed");

    // Update user's total points and level in SQL (global points)
    const updateResult = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .input("Points", sql.Int, points).query(`
        UPDATE user_gamification 
        SET total_points = total_points + @Points,
            level = (total_points + @Points) / 100 + 1,
            updated_at = GETDATE()
        WHERE user_id = @UserId;
        
        SELECT total_points, level FROM user_gamification WHERE user_id = @UserId;
      `);

    const updatedData = updateResult.recordset[0];

    // Update project leaderboard in Firebase (project-specific points)
    await updateProjectLeaderboard(
      projectId,
      userId,
      points,
      userName,
      userRole
    );

    // Get current project points and badges
    const leaderboardSnap = await db
      .collection("projects")
      .doc(projectId)
      .collection("gamification")
      .doc("leaderboard")
      .get();

    const leaderboardData = leaderboardSnap.data() || {};
    const projectPoints = leaderboardData[userId]?.points || 0;
    const projectBadges = leaderboardData[userId]?.badges || [];

    // Check for new badges
    const newBadges = await checkForNewBadges(userId, projectPoints, projectId);

    console.log(`Awarded ${points} points to user ${userId} for ${action}`);

    return {
      success: true,
      pointsAwarded: points,
      totalPoints: updatedData.total_points,
      globalPoints: updatedData.total_points,
      projectPoints: projectPoints,
      level: updatedData.level,
      badges: projectBadges,
      newBadges,
    };
  } catch (error) {
    console.error("Error awarding points:", error);
    throw error;
  }
};

const updateProjectLeaderboard = async (
  projectId: string,
  userId: number,
  points: number,
  userName?: string,
  userRole?: string
) => {
  try {
    const leaderboardRef = db
      .collection("projects")
      .doc(projectId)
      .collection("gamification")
      .doc("leaderboard");

    // Get current user data to preserve badges
    const currentData = await leaderboardRef.get();
    const currentUserData = currentData.data()?.[userId] || {};

    // Update user data in Firebase
    const userDataUpdate: any = {};
    userDataUpdate[userId] = {
      points: FieldValue.increment(points),
      lastUpdate: FieldValue.serverTimestamp(),
      badges: currentUserData.badges || [], // Preserve existing badges
    };

    if (userName) userDataUpdate[userId].name = userName;
    if (userRole) userDataUpdate[userId].role = userRole;

    await leaderboardRef.set(userDataUpdate, { merge: true });
  } catch (error) {
    console.error("Error updating project leaderboard:", error);
  }
};

const checkForNewBadges = async (
  userId: number,
  projectPoints: number,
  projectId: string
): Promise<Badge[]> => {
  try {
    // Get current badges from Firebase
    const leaderboardRef = db
      .collection("projects")
      .doc(projectId)
      .collection("gamification")
      .doc("leaderboard");

    const leaderboardSnap = await leaderboardRef.get();
    const leaderboardData = leaderboardSnap.data() || {};
    const currentBadges: Badge[] = leaderboardData[userId]?.badges || [];
    const newBadges: Badge[] = [];

    // Define badge thresholds with Lucide icon names
    const badgeThresholds: Omit<Badge, "earnedAt" | "projectId">[] = [
      { name: "First Steps", points: 10, icon: "Rocket" },
      { name: "Getting Started", points: 50, icon: "Star" },
      { name: "Rising Star", points: 100, icon: "TrendingUp" },
      { name: "Productive", points: 250, icon: "Award" },
      { name: "Expert", points: 500, icon: "ShieldCheck" },
      { name: "Master", points: 1000, icon: "Crown" },
    ];

    for (const badge of badgeThresholds) {
      if (
        projectPoints >= badge.points &&
        !currentBadges.some(
          (b) => b.name === badge.name && b.projectId === projectId
        )
      ) {
        const newBadge: Badge = {
          ...badge,
          earnedAt: new Date(),
          projectId: projectId,
        };
        newBadges.push(newBadge);
        currentBadges.push(newBadge);
      }
    }

    // Update badges in Firebase if new ones were earned
    if (newBadges.length > 0) {
      const userDataUpdate: any = {};
      userDataUpdate[userId] = {
        badges: currentBadges,
        lastUpdate: FieldValue.serverTimestamp(),
      };

      await leaderboardRef.set(userDataUpdate, { merge: true });
    }

    return newBadges;
  } catch (error) {
    console.error("Error checking badges:", error);
    return [];
  }
};

// Helper function to calculate points based on task type
// Updated function in gamificationService.ts
export const calculateTaskPoints = (taskData: any): number => {
  const basePoints: { [key: string]: number } = {
    epic: 50,
    story: 25,
    bug: 15,
    techTask: 20,
    knowledge: 10,
    task: 15,
    subtask: 5,
  };

  const points = basePoints[taskData.type?.toLowerCase()] || 15;

  const fibonacciMultiplier = getFibonacciMultiplier(taskData.storyPoints);

  return Math.floor(points * fibonacciMultiplier);
};

const getFibonacciMultiplier = (storyPoints?: number): number => {
  const multipliers: { [key: number]: number } = {
    1: 0.5,
    2: 0.8,
    3: 1.0,
    5: 1.3,
    8: 1.8,
    13: 2.5,
    21: 3.5,
  };

  return multipliers[storyPoints || 3] || 1.0;
};
