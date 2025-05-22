// controllers/projectController.ts
import {NextFunction, Request, Response} from "express";
import {FieldValue} from "firebase-admin/firestore";
import {db} from "../models/firebase.js";
import {Project} from "../../types/project.js";

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
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(400).json({message: "User ID missing"});
        }

        const membersSnap = await db
            .collectionGroup("members")
            .where("userId", "==", userId)
            .get();

        if (membersSnap.empty) {
            return res.status(200).json([]);
        }

        const projectRefs = membersSnap.docs.map(doc =>
            db.collection("projects").doc(doc.ref.parent.parent!.id)
        );

        const projectSnaps = await db.getAll(...projectRefs);

        const projects: Project[] = projectSnaps.map(snap => ({
            id: snap.id,
            ...(snap.data() as Project)
        }));

        return res.status(200).json(projects);
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
        const {
            name,
            description,
            context,
            status = "Active",
            members = [],
        } = req.body;
        const ownerId = req.user?.userId;

        // Validate the project name
        if (!name || typeof name !== "string" || name.trim() === "") {
            res.status(400).json({message: "Project name is required"});
            return;
        }

        // Prepare the project data
        const projectData = {
            name: name.trim(),
            description: description || null,
            members: members,
            ownerId,
            status: status,
            context: context || null,
        };

        // Create a batch to perform multiple operations atomically
        const batch = db.batch();

        // Create a new project document
        const projectRef = db.collection("projects").doc();
        batch.set(projectRef, {
            ...projectData,
            createdAt: FieldValue.serverTimestamp(),
        });

        // Add the creator as a member with the owner role
        const memberRef = projectRef.collection("members").doc(String(ownerId));
        const defaultOwnerRoleId = "product-owner";
        batch.set(memberRef, {
            userId: ownerId,
            projectRoleId: defaultOwnerRoleId,
            joinedAt: FieldValue.serverTimestamp(),
        });

        // Add the members to the project
        for (const member of members) {
            const memberRef = projectRef
                .collection("members")
                .doc(String(member.userId));
            batch.set(memberRef, {
                userId: member.userId,
                projectRoleId: member.projectRoleId,
                joinedAt: FieldValue.serverTimestamp(),
            });
        }
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
        const {projectId} = req.params;

        // Get the project document from Firestore
        const projectRef = db.collection("projects").doc(projectId);
        const doc = await projectRef.get();

        // Check if the project exists
        if (!doc.exists) {
            res.status(404).json({message: "Project not found"});
            return;
        }

        // Fetch members subcollection
        const membersSnap = await projectRef.collection("members").get();
        const members = membersSnap.docs.map(memberDoc => ({
            userId: memberDoc.data().userId,
            projectRoleId: memberDoc.data().projectRoleId,
        }));

        // Return the project details with members array
        res.status(200).json({
            id: doc.id,
            ...doc.data(),
            members,
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
        const {projectId} = req.params;
        const {name, description, context, status, startDate, endDate, visibility} = req.body;

        // Get the project document reference
        const projectRef = db.collection("projects").doc(projectId);

        const updateData: { [key: string]: any } = {};

        // Validate and add name if provided
        if (name !== undefined) {
            if (typeof name !== "string" || name.trim() === "") {
                res.status(400).json({message: "Invalid project name"});
                return;
            }
            updateData.name = name.trim();
        }

        // Validate and add description if provided
        if (description !== undefined) {
            if (description !== null && typeof description !== "string") {
                res.status(400).json({message: "Invalid description type"});
                return;
            }
            updateData.description = description;
        }

        // Validate and add context if provided
        if (context !== undefined) {
            if (context !== null && typeof context !== "object") {
                res.status(400).json({message: "Invalid context type"});
                return;
            }
            updateData.context = context;
        }

        // Add status, user will not provide this field
        updateData.status = status;

        // Add startDate, user will not provide this field
        updateData.startDate = startDate;

        // Add endDate, user will not provide this field
        updateData.endDate = endDate;

        // Add visibility, user will not provide this field
        updateData.visibility = visibility;

        // Check if any valid fields were provided
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({message: "No valid fields provided"});
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
        const {projectId} = req.params;

        // Get the project document reference
        const projectRef = db.collection("projects").doc(projectId);

        // Check if the project exists
        const doc = await projectRef.get();
        if (!doc.exists) {
            res.status(404).json({message: "Project not found"});
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
