// src/controllers/taskController.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { db } from "../models/firebase.js"; // Adjust path if needed
import { FieldValue } from "firebase-admin/firestore";
import {
  CreateSprintItemDTO,
  UpdateSprintItemDTO,
} from "../../types/sprint.js"; // Adjust path if needed
import { getItemRef } from "../utils/helpers/firestoreHelpers.js"; // Adjust path if needed

// --- Task Management ---

/**
 * @description Add a task (derived from a backlog item) to a specific sprint.
 *              Verifies sprint and backlog item existence and project relationship.
 * @route POST /api/v1/projects/:projectId/sprints/:sprintId/tasks
 * @access Private (requires auth, project membership, permissions)
 */
export const createTask: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, sprintId } = req.params; // Assumed present by routing
    const { backlogId, originalType, assigneeId }: CreateSprintItemDTO =
      req.body;

    // --- Input Validation ---
    if (!backlogId || !originalType) {
      return res.status(400).json({
        message: "backlogId and originalType are required in the body",
      });
    }

    const sprintRef = db.collection("sprints").doc(sprintId); // Top-level sprints
    const tasksCollection = db.collection("tasks"); // Top-level tasks
    const backlogItemRef = getItemRef(projectId, originalType, backlogId); // Helper gets backlog ref

    // --- Verification Steps ---

    // 1. Check Sprint existence and its relationship to the Project
    const sprintSnap = await sprintRef.get();
    if (!sprintSnap.exists) {
      return res.status(404).json({ message: "Target sprint not found" });
    }
    if (sprintSnap.data()?.projectId !== projectId) {
      // Ensure the sprint belongs to the project in the URL
      return res.status(403).json({
        message: "Forbidden: Sprint does not belong to the specified project",
      });
    }

    // 2. Check Backlog Item existence (concurrently with checking for existing task)
    // 3. Check if this Backlog Item is already a Task in this Sprint
    const [backlogItemSnap, existingTaskSnap] = await Promise.all([
      backlogItemRef.get(),
      tasksCollection
        .where("projectId", "==", projectId) // Scope task query
        .where("sprintId", "==", sprintId)
        .where("backlogId", "==", backlogId) // Look for same original item
        .limit(1)
        .get(),
    ]);

    if (!backlogItemSnap.exists) {
      return res
        .status(404)
        .json({ message: "Original backlog item not found" });
    }
    if (!existingTaskSnap.empty) {
      // Prevent adding the same backlog item twice to the same sprint
      return res.status(400).json({
        message: "This item already exists as a task in this sprint",
      });
    }

    // --- Calculate Task Order  ---
    const todoTasksSnap = await tasksCollection
      .where("projectId", "==", projectId)
      .where("sprintId", "==", sprintId)
      .where("status", "==", "ToDo")
      .orderBy("order", "desc") // Get highest order number
      .limit(1)
      .get();
    const lastOrder = todoTasksSnap.empty
      ? 0
      : todoTasksSnap.docs[0].data().order || 0;
    const nextOrder = lastOrder + 1000; // Simple increment strategy

    // --- Prepare Task Data ---
    // Inherit title/description from backlog item
    const backlogData = backlogItemSnap.data();
    const taskData = {
      projectId,
      sprintId,
      backlogId,
      type: backlogData?.type,
      title: backlogData?.title || "Untitled Task", // Inherit title
      description: backlogData?.description || null, // Inherit description
      status: "ToDo", // Default status
      assigneeId: assigneeId || null,
      order: nextOrder,
      subtasksCompleted: 0,
      subtasksTotal: 0,
      priority: backlogData?.priority || null, // Inherit priority
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // --- Create Task in Firestore ---
    const taskRef = await tasksCollection.add(taskData);
    const createdTaskSnap = await taskRef.get();

    res.status(201).json({ id: taskRef.id, ...createdTaskSnap.data() });
  } catch (error) {
    console.error(`Error adding item to sprint ${req.params.sprintId}:`, error);
    next(error); // Pass to central error handler
  }
};

/**
 * @description Get all tasks for a specific sprint within a project.
 *              Verifies sprint existence and project relationship first.
 * @route GET /api/v1/projects/:projectId/sprints/:sprintId/tasks
 * @access Private (requires auth, project membership)
 */
export const getSprintTasks: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, sprintId } = req.params; // Assumed present

    // --- Verification: Check if the sprint exists and belongs to the project ---
    // Necessary because 'sprints' is top-level
    const sprintRef = db.collection("sprints").doc(sprintId);
    const sprintSnap = await sprintRef.get();
    if (!sprintSnap.exists) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    if (sprintSnap.data()?.projectId !== projectId) {
      return res.status(403).json({
        message: "Forbidden: Sprint does not belong to the specified project",
      });
    }
    // --- End Verification ---

    // --- Fetch Tasks ---
    // Query top-level 'tasks' collection, filtering by project and sprint
    const tasksSnap = await db
      .collection("tasks")
      .where("projectId", "==", projectId)
      .where("sprintId", "==", sprintId)
      .orderBy("order", "asc") // Order by intended sequence
      // .orderBy("createdAt", "desc") // Secondary sort if needed
      .get();
    // Note: Composite index likely required in Firestore for projectId+sprintId+order.

    // --- Format Response ---
    const tasks = tasksSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Timestamps are returned as Firestore Timestamp objects by default
    }));

    res.status(200).json(tasks);
  } catch (error) {
    console.error(
      `Error getting tasks for sprint ${req.params.sprintId}:`,
      error
    );
    next(error);
  }
};

/**
 * @description Update specific fields of a task (excluding status).
 *              Verifies task existence and project relationship.
 * @route PATCH /api/v1/projects/:projectId/tasks/:taskId
 * @access Private (requires auth, project membership, permissions)
 */
export const updateTask: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params; // Assumed present
    const updates = req.body as UpdateSprintItemDTO;

    if (!taskId) {
      // Basic validation
      return res.status(400).json({ message: "taskId parameter is required" });
    }

    const taskRef = db.collection("tasks").doc(taskId); // Top-level tasks

    // --- Verification: Check Task exists and belongs to the Project ---
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (taskSnap.data()?.projectId !== projectId) {
      return res.status(403).json({
        message: "Forbidden: Task does not belong to the specified project",
      });
    }

    // --- Prepare Update Object ---
    const allowedFields = [
      "title",
      "description",
      "assigneeId",
      "priority",
      "order",
      "type",
      "subtasksCompleted",
      "subtasksTotal",
      "coverImageUrl",
    ];
    const updateFields: Record<string, any> = {};
    for (const field of allowedFields) {
      if (updates[field as keyof UpdateSprintItemDTO] !== undefined) {
        updateFields[field] = updates[field as keyof UpdateSprintItemDTO];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }
    updateFields.updatedAt = FieldValue.serverTimestamp(); // Always update timestamp

    // --- Update in Firestore ---
    await taskRef.update(updateFields);
    const updatedSnap = await taskRef.get(); // Re-fetch to return full updated data

    res.status(200).json({ id: taskId, ...updatedSnap.data() });
  } catch (error) {
    console.error(`Error updating task ${req.params.taskId}:`, error);
    next(error);
  }
};

/**
 * @description Update ONLY the status of a task.
 *              Verifies task existence and project relationship.
 * @route PATCH /api/v1/projects/:projectId/tasks/:taskId/status
 * @access Private (requires auth, project membership, permissions)
 */
export const updateTaskStatus: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params; // Assumed present
    const { status } = req.body;

    // --- Input Validation ---
    if (!taskId) {
      return res.status(400).json({ message: "taskId parameter is required" });
    }
    if (!status) {
      return res
        .status(400)
        .json({ message: "status is required in the body" });
    }
    // Optional: Add validation here to check if 'status' is one of your allowed values.

    const taskRef = db.collection("tasks").doc(taskId); // Top-level tasks

    // --- Verification: Check Task exists and belongs to the Project ---
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (taskSnap.data()?.projectId !== projectId) {
      return res.status(403).json({
        message: "Forbidden: Task does not belong to the specified project",
      });
    }
    // --- End Verification ---

    // --- Update Status in Firestore ---
    await taskRef.update({
      status: status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Good Practice: Return confirmation and key updated fields
    res.status(200).json({
      message: "Task status updated successfully",
      id: taskId,
      status: status, // Return the new status
    });
  } catch (error) {
    console.error(
      `Error updating status for task ${req.params.taskId}:`,
      error
    );
    next(error);
  }
};

/**
 * @description Remove (delete) a task.
 *              Verifies task existence and project relationship.
 * @route DELETE /api/v1/projects/:projectId/tasks/:taskId
 * @access Private (requires auth, project membership, permissions)
 */
export const removeTask: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params; // Assumed present

    if (!taskId) {
      // Basic validation
      return res.status(400).json({ message: "taskId parameter is required" });
    }

    const taskRef = db.collection("tasks").doc(taskId); // Top-level tasks

    // --- Verification: Check Task exists and belongs to the Project ---
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (taskSnap.data()?.projectId !== projectId) {
      return res.status(403).json({
        message: "Forbidden: Task does not belong to the specified project",
      });
    }
    // --- End Verification ---

    // --- Delete from Firestore ---
    await taskRef.delete();

    // Good Practice: Return confirmation message
    res.status(200).json({ message: "Task deleted successfully", id: taskId });
  } catch (error) {
    console.error(`Error removing task ${req.params.taskId}:`, error);
    next(error);
  }
};
