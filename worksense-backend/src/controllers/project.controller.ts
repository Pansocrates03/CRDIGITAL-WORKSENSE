// controllers/projectController.ts
import { Request, Response, NextFunction } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../models/firebase.js";
import { Project } from "../../types/project.js";
import * as memberController from "./member.controller.js";
import * as backlogController from "./backlog.controller.js";

/**
 * Helper function to get the default owner role ID for new projects
 * This is used when creating a new project to assign the creator as the owner
 */
async function getDefaultOwnerRoleId(): Promise<string> {
  try {
    // Try to find the "Product Owner" role in the projectRoles collection
    const roleQuery = await db
      .collection("projectRoles")
      .where("name", "==", "Product Owner")
      .limit(1)
      .get();

    // If found, return the role ID
    if (!roleQuery.empty) {
      return roleQuery.docs[0].id;
    }
  } catch (error) {
    // If there's an error, we'll use the fallback ID
    console.error("Error getting default owner role:", error);
  }

  // Fallback ID if no role is found or there's an error
  return "product-owner";
}

/**
 * List all projects that the current user is a member of
 *
 * This function:
 * 1. Gets the current user's ID from the request
 * 2. Fetches all projects from the database
 * 3. For each project, checks if the user is a member
 * 4. Returns a list of projects the user is a member of
 */
export const listUserProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the user ID from the request
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // Get all projects from the database
    const projectsSnapshot = await db.collection("projectss").get();

    // If no projects exist, return an empty array
    if (projectsSnapshot.empty) {
      res.status(200).json([]);
      return;
    }

    // Check each project to see if the user is a member
    const projects: Project[] = [];
    const promises = projectsSnapshot.docs.map(async (projectDoc) => {
      // Check if the user is a member of this project
      const memberDoc = await projectDoc.ref
        .collection("members")
        .where("userId", "==", userId)
        .get();

      // If the user is a member, add the project to the results
      if (!memberDoc.empty) {
        projects.push({
          id: projectDoc.id,
          ...projectDoc.data(),
        } as Project);
      }
    });

    // Wait for all checks to complete
    await Promise.all(promises);

    // Return the list of projects
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project
 *
 * This function:
 * 1. Validates the project data from the request
 * 2. Creates a new project document in Firestore
 * 3. Adds the creator as a member with the owner role
 * 4. Returns the created project
 */
export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get project data from the request
    const { name, description, context } = req.body;
    const ownerId = req.user?.userId;

    // Check if the user is authenticated
    if (!ownerId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // Validate the project name
    if (!name || typeof name !== "string" || name.trim() === "") {
      res.status(400).json({ message: "Project name is required" });
      return;
    }

    // Prepare the project data
    const projectData = {
      name: name.trim(),
      description: description || null,
      ownerId,
      context: context || null,
    };

    // Create a batch to perform multiple operations atomically
    const batch = db.batch();

    // Create a new project document
    const projectRef = db.collection("projectss").doc();
    batch.set(projectRef, {
      ...projectData,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Add the creator as a member with the owner role
    const memberRef = projectRef.collection("members").doc(String(ownerId));
    const defaultOwnerRoleId = await getDefaultOwnerRoleId();
    batch.set(memberRef, {
      userId: ownerId,
      projectRoleId: defaultOwnerRoleId,
      joinedAt: FieldValue.serverTimestamp(),
    });

    // Commit the batch to perform all operations
    await batch.commit();

    // Get the created project and return it
    const createdProjectSnap = await projectRef.get();
    res.status(201).json({
      id: createdProjectSnap.id,
      ...createdProjectSnap.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get details of a specific project
 *
 * This function:
 * 1. Gets the project ID from the request parameters
 * 2. Fetches the project document from Firestore
 * 3. Returns the project details
 */
export const getProjectDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the project ID from the request parameters
    const { projectId } = req.params;

    // Get the project document from Firestore
    const projectRef = db.collection("projectss").doc(projectId);
    const doc = await projectRef.get();

    // Check if the project exists
    if (!doc.exists) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Return the project details
    res.status(200).json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a project
 *
 * This function:
 * 1. Gets the project ID and update data from the request
 * 2. Validates the update data
 * 3. Updates the project document in Firestore
 * 4. Returns the updated project
 */
export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the project ID and update data from the request
    const { projectId } = req.params;
    const { name, description, context } = req.body;

    // Get the project document reference
    const projectRef = db.collection("projectss").doc(projectId);

    // Prepare the update data
    const updateData: { [key: string]: any } = {};

    // Validate and add name if provided
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        res.status(400).json({ message: "Invalid project name" });
        return;
      }
      updateData.name = name.trim();
    }

    // Validate and add description if provided
    if (description !== undefined) {
      if (description !== null && typeof description !== "string") {
        res.status(400).json({ message: "Invalid description type" });
        return;
      }
      updateData.description = description;
    }

    // Validate and add context if provided
    if (context !== undefined) {
      if (context !== null && typeof context !== "object") {
        res.status(400).json({ message: "Invalid context type" });
        return;
      }
      updateData.context = context;
    }

    // Check if any valid fields were provided
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: "No valid fields provided" });
      return;
    }

    // Add the update timestamp
    updateData.updatedAt = FieldValue.serverTimestamp();

    // Update the project document
    await projectRef.update(updateData);

    // Get the updated project and return it
    const updatedDoc = await projectRef.get();
    res.status(200).json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a project
 *
 * This function:
 * 1. Gets the project ID from the request parameters
 * 2. Checks if the project exists
 * 3. Deletes the project document from Firestore
 * 4. Returns a success message
 */
export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the project ID from the request parameters
    const { projectId } = req.params;

    // Get the project document reference
    const projectRef = db.collection("projectss").doc(projectId);

    // Check if the project exists
    const doc = await projectRef.get();
    if (!doc.exists) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Delete the project document
    await projectRef.delete();

    // Return a success message
    res.status(200).json({
      message: "Project deleted successfully",
      id: projectId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive project data including all related collections
 *
 * This function aggregates data from:
 * - Project details
 * - Project members
 * - Epics
 * - Stories
 * - Bugs
 * - Tech Tasks
 * - Knowledge items
 */
export const getProjectAggregatedData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    // Create a modified request object for each controller call
    const modifiedReq = {
      ...req,
      params: { projectId },
    } as unknown as Request;

    // Helper function to capture controller response
    const captureResponse = async (controllerFn: Function) => {
      let capturedData: any;
      const mockRes = {
        status: () => mockRes,
        json: (data: any) => {
          capturedData = data;
          return data;
        },
      } as any;

      await controllerFn(modifiedReq, mockRes, next);
      return capturedData;
    };

    // Get project details using existing controller
    const projectData = await captureResponse(getProjectDetails);

    // Get members with email using existing controller
    const membersData = await captureResponse(
      memberController.listMembersWithEmail
    );

    // Get backlog items using existing controller
    const backlogData = await captureResponse(
      backlogController.listBacklogItems
    );

    // Get user's role and permissions
    const memberRef = db
      .collection("projectss")
      .doc(projectId)
      .collection("members")
      .doc(String(userId));

    const memberSnap = await memberRef.get();
    let userPermissions: string[] = [];

    if (memberSnap.exists) {
      const memberData = memberSnap.data();
      if (memberData?.projectRoleId) {
        const roleRef = db
          .collection("projectRoles")
          .doc(memberData.projectRoleId);
        const roleSnap = await roleRef.get();
        if (roleSnap.exists) {
          const roleData = roleSnap.data();
          userPermissions = roleData?.permissions || [];
        }
      }
    }

    // Organize backlog items by type
    const backlog = {
      epics: backlogData.filter((item: any) => item.type === "epic"),
      stories: backlogData.filter((item: any) => item.type === "story"),
      bugs: backlogData.filter((item: any) => item.type === "bug"),
      techTasks: backlogData.filter((item: any) => item.type === "techTask"),
      knowledge: backlogData.filter((item: any) => item.type === "knowledge"),
    };

    // Return aggregated data with user permissions
    res.status(200).json({
      project: projectData,
      members: membersData,
      backlog,
      userPermissions,
    });
  } catch (error) {
    next(error);
  }
};
