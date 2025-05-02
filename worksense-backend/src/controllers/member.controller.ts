// controllers/memberController.ts
// Última actualización: 1 de mayo de 2025
// Esteban Sierra Baccio

import { Request, Response, NextFunction } from "express";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "../models/firebase.js";
import { sqlConnect, sql } from "../models/sqlModel.js";
import { ProjectMember, ProjectMemberData } from "../../types/project.js";

/**
 * List members of a project
 */
export const listMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const membersRef = db
      .collection("projects")
      .doc(projectId)
      .collection("members");

    const snapshot = await membersRef.get();

    const members: ProjectMember[] = [];
    snapshot.forEach((doc) => {
      const memberData = doc.data() as Omit<ProjectMemberData, "userId">;
      members.push({
        userId: parseInt(doc.id, 10),
        ...memberData,
      });
    });

    res.status(200).json(members);
  } catch (error) {
    next(error);
  }
};

/**
 * List members of a project with their email information from SQL DB
 */
export const listMembersDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const membersRef = db
      .collection("projects")
      .doc(projectId)
      .collection("members");

    const snapshot = await membersRef.get();

    // If no members found
    if (snapshot.empty) {
      res.status(200).json([]);
      return;
    }

    const members: ProjectMember[] = [];
    const userIds: number[] = [];

    snapshot.forEach((doc) => {
      const memberData = doc.data() as Omit<ProjectMemberData, "userId">;
      const userId = parseInt(doc.id, 10);
      userIds.push(userId);
      members.push({
        userId,
        ...memberData,
      });
    });

    // If we don't have any valid userIds, return early
    if (userIds.length === 0) {
      res.status(200).json(members);
      return;
    }

    // Connect to SQL database
    const pool = await sqlConnect();
    if (!pool) {
      res.status(500).json({ message: "Database connection error" });
      return;
    }

    try {
      // Use the improved stored procedure to fetch all user data at once
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

        // Enrich members with user information
        const membersWithUserInfo = members.map((member) => {
          const userData = userDataMap.get(member.userId);
          if (userData) {
            return {
              ...member,
              name: `${userData.firstName} ${userData.lastName}`,
              email: userData.email,
              lastLogin: userData.lastSignIn,
              nickname: userData.nickName,
              profilePicture: userData.pfp,
            };
          }
          return member;
        });

        res.status(200).json(membersWithUserInfo);
        return;
      }
    } catch (sqlError) {
      console.error("SQL error fetching user data:", sqlError);
      // Continue execution to return basic member data
    }

    // Fallback: return basic member data without enrichment
    res.status(200).json(members);
  } catch (error) {
    next(error);
  }
};

/**
 * Add a user as a project member
 */
export const addMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { userId, projectRoleId } = req.body;

    // Basic validation
    if (!userId || typeof userId !== "number") {
      res.status(400).json({ message: "Valid User ID required" });
      return;
    }
    if (!projectRoleId) {
      res.status(400).json({ message: "Valid Project Role ID required" });
      return;
    }

    // Check if user exists
    const pool = await sqlConnect();
    if (!pool) {
      res.status(500).json({ message: "Database connection error" });
      return;
    }

    const userExistsResult = await pool
      .request()
      .input("id", sql.Int, userId)
      .execute("spCheckUserExists");

    if (userExistsResult.recordset.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if role exists
    const roleRef = db
      .collection("projectRoles")
      .doc(projectRoleId);

    const roleSnap = await roleRef.get();
    if (!roleSnap.exists) {
      res.status(400).json({ message: "Project Role not found" });
      return;
    }

    // Check if user is already a member
    const memberRef = db
      .collection("projects")
      .doc(projectId)
      .collection("members")
      .doc(String(userId));

    const memberSnap = await memberRef.get();
    if (memberSnap.exists) {
      res.status(409).json({ message: "User is already a member" });
      return;
    }

    // Add new member
    const newMemberData = {
      userId,
      projectRoleId,
      joinedAt: Timestamp.now(),
    };

    await memberRef.set(newMemberData);
    res.status(201).json(newMemberData);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a member's role
 */
export const updateMemberRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, userId: userIdString } = req.params;
    const { projectRoleId } = req.body;
    const memberUserId = parseInt(userIdString, 10);

    if (isNaN(memberUserId)) {
      res.status(400).json({ message: "Invalid User ID" });
      return;
    }

    if (!projectRoleId) {
      res.status(400).json({ message: "Valid Project Role ID required" });
      return;
    }

    // Check if role exists
    const roleRef = db
      .collection("projectRoles")
      .doc(projectRoleId);

    const roleSnap = await roleRef.get();
    if (!roleSnap.exists) {
      res.status(400).json({ message: "Project Role not found" });
      return;
    }

    // Check if member exists
    const memberRef = db
      .collection("projects")
      .doc(projectId)
      .collection("members")
      .doc(String(memberUserId));

    const memberSnap = await memberRef.get();
    if (!memberSnap.exists) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    // Update role
    await memberRef.update({ projectRoleId });

    const updatedData = {
      ...memberSnap.data(),
      projectRoleId,
    };

    res.status(200).json(updatedData);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a member from a project
 */
export const removeMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, userId: userIdString } = req.params;
    const memberUserId = parseInt(userIdString, 10);

    if (isNaN(memberUserId)) {
      res.status(400).json({ message: "Invalid User ID" });
      return;
    }

    // Check if project exists and member is not owner
    const projectSnap = await db.collection("projects").doc(projectId).get();
    if (!projectSnap.exists) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (projectSnap.data()?.ownerId === memberUserId) {
      res.status(403).json({ message: "Cannot remove project owner" });
      return;
    }

    // Check if member exists
    console.log("Checking if member exists...", memberUserId);
    const memberRef = db
      .collection("projects")
      .doc(projectId)
      .collection("members")
      .doc(String(memberUserId));

    const memberSnap = await memberRef.get();
    if (!memberSnap.exists) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    // Remove member
    await memberRef.delete();
    res.status(200).json({
      message: "Member removed",
      projectId,
      userId: memberUserId,
    });
  } catch (error) {
    next(error);
  }
};
