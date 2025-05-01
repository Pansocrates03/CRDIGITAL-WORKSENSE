// src/controllers/taskController.ts (or sprintItems.controller.ts - unified file example)
import { Request, Response, NextFunction, RequestHandler } from "express";
import { db } from "../models/firebase.js"; // Adjust path if needed
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  CreateSprintItemDTO, // Assuming this type does NOT include projectId anymore
  UpdateSprintItemDTO,
} from "../../types/sprint.js"; // Adjust path if needed
import { getItemRef } from "../utils/helpers/firestoreHelpers.js"; // Adjust path if needed

// --- Task Management (within Sprint/Project Context) ---

export const addItemToSprint: RequestHandler = async (req, res, next) => {
  try {
    // Get IDs from path parameters
    const { projectId, sprintId } = req.params;
    const {
      type,
      originalId,
      originalType,
      assigneeId, // Changed from sprintAssigneeId for consistency
      title,
      description,
    }: CreateSprintItemDTO = req.body;

    // Validate path parameters
    if (!projectId || !sprintId) {
      return res
        .status(400)
        .json({ message: "projectId and sprintId parameters are required" });
    }
    // Validate body parameters
    if (!originalId || !originalType || !type) {
      // Type is also essential for the task itself
      return res.status(400).json({
        message: "type, originalId, and originalType are required in the body",
      });
    }

    const sprintRef = db.collection("sprints").doc(sprintId);
    const taskCollectionRef = db.collection("tasks");

    // --- Verification Steps ---
    // 1. Check Sprint existence and project relationship
    const sprintSnap = await sprintRef.get();
    if (!sprintSnap.exists) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (sprintSnap.data()?.projectId !== projectId) {
      return res
        .status(403)
        .json({ message: "Sprint does not belong to the specified project" });
    }

    // 2. Check Backlog Item existence (concurrently)
    // 3. Check if Task already exists in Sprint (concurrently)
    const [backlogItemSnap, existingTaskSnap] = await Promise.all([
      getItemRef(projectId, originalType, originalId).get(),
      taskCollectionRef
        .where("sprintId", "==", sprintId)
        .where("originalId", "==", originalId)
        .where("projectId", "==", projectId) // Ensure scope
        .limit(1)
        .get(),
    ]);

    if (!backlogItemSnap.exists) {
      return res.status(404).json({ message: "Backlog item not found" });
    }
    if (!existingTaskSnap.empty) {
      return res
        .status(400)
        .json({ message: "Item already exists in this sprint" });
    }
    // --- End Verification ---

    // Get next order value
    const todoTasksSnap = await taskCollectionRef
      .where("sprintId", "==", sprintId)
      .where("projectId", "==", projectId) // Scope query
      .where("status", "==", "ToDo")
      .orderBy("order", "desc")
      .limit(1)
      .get();

    const nextOrder = todoTasksSnap.empty
      ? 1000
      : (todoTasksSnap.docs[0].data().order || 0) + 1000;

    // Prepare task data (projectId comes from params)
    const taskData = {
      projectId, // From path params
      sprintId, // From path params
      type, // From body
      originalId,
      originalType,
      title: backlogItemSnap.data()?.title || "Untitled Task",
      description: backlogItemSnap.data()?.description || null,
      status: "ToDo",
      assigneeId: assigneeId || null,
      order: nextOrder,
      subtasksCompleted: 0,
      subtasksTotal: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      priority: backlogItemSnap.data()?.priority || null,
    };

    const taskRef = await taskCollectionRef.add(taskData);
    const createdTaskSnap = await taskRef.get();

    res.status(201).json({ id: taskRef.id, ...createdTaskSnap.data() });
  } catch (error) {
    console.error("Error adding item to sprint:", error);
    next(
      error || new Error("Internal server error while adding item to sprint")
    );
  }
};

/**
 * Get all tasks for a specific sprint within a project.
 * Associated Route: GET /api/projects/:projectId/sprints/:sprintId/tasks
 */
export const getSprintTasks: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, sprintId } = req.params;

    if (!projectId || !sprintId) {
      return res
        .status(400)
        .json({ message: "projectId and sprintId parameters are required" });
    }

    // --- Verification Step ---
    const sprintRef = db.collection("sprints").doc(sprintId);
    const sprintSnap = await sprintRef.get();
    if (!sprintSnap.exists) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (sprintSnap.data()?.projectId !== projectId) {
      return res
        .status(403)
        .json({ message: "Sprint does not belong to the specified project" });
    }
    // --- End Verification ---

    const tasksSnap = await db
      .collection("tasks")
      .where("sprintId", "==", sprintId)
      .where("projectId", "==", projectId)
      .orderBy("order", "asc")
      .orderBy("createdAt", "desc")
      .get();

    const tasks = tasksSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || null,
        updatedAt: data.updatedAt?.toDate() || null,
      };
    });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting sprint tasks:", error);
    next(
      error || new Error("Internal server error while fetching sprint tasks")
    );
  }
};

/**
 * Update specific fields of a task within a project.
 * Associated Route: PATCH /api/projects/:projectId/tasks/:taskId
 */
export const updateTask: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const allowedUpdates = req.body as UpdateSprintItemDTO; // Assuming this type has the allowed fields

    if (!projectId || !taskId) {
      return res
        .status(400)
        .json({ message: "projectId and taskId parameters are required" });
    }

    const taskRef = db.collection("tasks").doc(taskId);

    // --- Verification Step ---
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (taskSnap.data()?.projectId !== projectId) {
      return res
        .status(403)
        .json({ message: "Task does not belong to the specified project" });
    }
    // --- End Verification ---

    // Construct update object carefully from allowed fields in body
    const updateFields: Record<string, any> = {};
    // Explicitly check allowed fields from DTO to prevent mass assignment issues
    if (allowedUpdates.title !== undefined)
      updateFields.title = allowedUpdates.title;
    if (allowedUpdates.description !== undefined)
      updateFields.description = allowedUpdates.description;
    if (allowedUpdates.assigneeId !== undefined)
      updateFields.assigneeId = allowedUpdates.assigneeId;
    if (allowedUpdates.priority !== undefined)
      updateFields.priority = allowedUpdates.priority;
    if (allowedUpdates.order !== undefined)
      updateFields.order = allowedUpdates.order;
    if (allowedUpdates.type !== undefined)
      updateFields.type = allowedUpdates.type;
    if (allowedUpdates.subtasksCompleted !== undefined)
      updateFields.subtasksCompleted = allowedUpdates.subtasksCompleted;
    if (allowedUpdates.subtasksTotal !== undefined)
      updateFields.subtasksTotal = allowedUpdates.subtasksTotal;
    if (allowedUpdates.coverImageUrl !== undefined)
      updateFields.coverImageUrl = allowedUpdates.coverImageUrl;
    // **IMPORTANT**: Do not allow updating 'status' here, use the dedicated endpoint.
    // **IMPORTANT**: Do not allow updating 'sprintId' or 'projectId' here easily.

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    updateFields.updatedAt = FieldValue.serverTimestamp();

    await taskRef.update(updateFields);
    const updatedSnap = await taskRef.get(); // Re-fetch to return the full updated document

    res.status(200).json({ id: taskId, ...updatedSnap.data() });
  } catch (error) {
    console.error("Error updating task:", error);
    next(error || new Error("Internal server error while updating task"));
  }
};

/**
 * Update ONLY the status of a task within a project.
 * Associated Route: PATCH /api/projects/:projectId/tasks/:taskId/status
 */
export const updateTaskStatus: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const { status } = req.body;

    if (!projectId || !taskId) {
      return res
        .status(400)
        .json({ message: "projectId and taskId parameters are required" });
    }
    if (!status) {
      return res
        .status(400)
        .json({ message: "status is required in the body" });
    }

    // Optional: Validate the status against allowed values from your config
    // const allowedStatuses = ["ToDo", "InProgress", "Review", "Done"];
    // if (!allowedStatuses.includes(status)) { ... }

    const taskRef = db.collection("tasks").doc(taskId);

    // --- Verification Step ---
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (taskSnap.data()?.projectId !== projectId) {
      return res
        .status(403)
        .json({ message: "Task does not belong to the specified project" });
    }
    // --- End Verification ---

    // Update only status and timestamp
    await taskRef.update({
      status: status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      message: "Task status updated successfully",
      id: taskId,
      status: status,
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    // Handle potential "NOT_FOUND" during update if needed, though pre-check helps
    next(
      error || new Error("Internal server error while updating task status")
    );
  }
};

/**
 * Remove (delete) a task within a project.
 * Associated Route: DELETE /api/projects/:projectId/tasks/:taskId
 */
export const removeTask: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;

    if (!projectId || !taskId) {
      return res
        .status(400)
        .json({ message: "projectId and taskId parameters are required" });
    }

    const taskRef = db.collection("tasks").doc(taskId);

    // --- Verification Step ---
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (taskSnap.data()?.projectId !== projectId) {
      return res
        .status(403)
        .json({ message: "Task does not belong to the specified project" });
    }
    // --- End Verification ---

    await taskRef.delete();

    res.status(200).json({ message: "Task deleted successfully", id: taskId });
  } catch (error) {
    console.error("Error removing task:", error);
    next(error || new Error("Internal server error while removing task"));
  }
};
