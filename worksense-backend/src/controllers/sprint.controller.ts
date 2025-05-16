// src/controllers/sprintController.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { db } from "../models/firebase.js"; // Adjust path if needed
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { SprintStatus } from "../types/sprint.js";
// --- Sprint Management ---

/*
import { Request, Response } from "express";
import { db } from "../models/firebase.js";
import { Timestamp } from "firebase-admin/firestore";
import { SprintCompletionMetrics, SprintItemStatus } from "../types/sprint.js";
*/

/**
 * @description Create a new sprint for a project.
 *              Sprints are stored in a top-level 'sprints' collection.
 *              Determines initial status ('Active' or 'Planned') based on other sprints for the SAME project.
 * @route POST /api/v1/projects/:projectId/sprints
 * @access Private (requires auth, project membership, permissions)
 */
export const createSprint: RequestHandler = async (req, res, next) => {
  try {
    const { projectId } = req.params; // Assumed to be present by routing
    const { name, goal, startDate, endDate } = req.body;

    // --- Input Validation ---
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      return res.status(400).json({ message: "Invalid date format provided" });
    }
    if (newStart >= newEnd) {
      return res
        .status(400)
        .json({ message: "startDate must be before endDate" });
    }
    // --- End Validation ---

    const sprintsCollection = db
      .collection("projects")
      .doc(projectId)
      .collection("sprints"); // Top-level collection

    // --- Determine Sprint Status ---
    // Check if there's already an active sprint *for this specific project*
    const activeSprintSnap = await sprintsCollection
      .where("projectId", "==", projectId) // Essential filter for top-level collection
      .where("status", "==", "Active")
      .limit(1)
      .get();
    const newSprintStatus = activeSprintSnap.empty ? "Active" : "Planned";

    // --- Prepare Data ---
    const sprintData = {
      projectId: projectId, // Store projectId to link back to the project
      name: name || `Sprint ${newStart.toLocaleDateString()}`,
      goal: goal || null,
      startDate: Timestamp.fromDate(newStart),
      endDate: Timestamp.fromDate(newEnd),
      status: newSprintStatus,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // --- Create in Firestore ---
    const sprintRef = await sprintsCollection.add(sprintData);
    const newSprintSnap = await sprintRef.get();

    res.status(201).json({ id: sprintRef.id, ...newSprintSnap.data() });
  } catch (error) {
    console.error(
      `Error creating sprint for project ${req.params.projectId}:`,
      error
    );
    next(error);
  }
};

/**
 * @description Get sprints for a specific project, optionally filtered by status.
 *              Queries the top-level 'sprints' collection using the projectId.
 * @route GET /api/v1/projects/:projectId/sprints(?status=Planned&status=Active)
 * @access Private (requires auth, project membership)
 */
export const getSprints: RequestHandler = async (req, res, next) => {
  try {
    const { projectId } = req.params; // Assumed present

    // Start query on the top-level collection
    let query = db.collection("sprints").where("projectId", "==", projectId); // Essential filter

    // --- Filtering by Status  ---
    const { status } = req.query;
    if (status) {
      const statusArray = Array.isArray(status) ? status : [status as string];
      query = query.where("status", "in", statusArray);
    }

    // --- Ordering ---
    query = query.orderBy("endDate", "desc");
    // Note: Composite index likely required in Firestore for projectId+status+endDate or projectId+endDate.

    // --- Fetch and Format ---
    const sprintsSnap = await query.get();
    const sprints = sprintsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(sprints);
  } catch (error) {
    console.error(
      `Error getting sprints for project ${req.params.projectId}:`,
      error
    );
    next(error);
  }
};

/**
 * @description Get a single sprint by its ID, ensuring it belongs to the specified project.
 *              Fetches from the top-level 'sprints' collection and verifies projectId.
 * @route GET /api/v1/projects/:projectId/sprints/:sprintId
 * @access Private (requires auth, project membership)
 */
export const getSprintById: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, sprintId } = req.params; // Assumed present

    if (!sprintId) {
      // Basic validation
      return res
        .status(400)
        .json({ message: "sprintId parameter is required" });
    }

    // --- Fetch from Firestore (Top-Level) ---
    const sprintRef = db
      .collection("projects")
      .doc(projectId)
      .collection("sprints")
      .doc(sprintId);
    const sprintSnap = await sprintRef.get();

    // --- Existence Check ---
    if (!sprintSnap.exists) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    const sprintData = sprintSnap.data();

    // --- Verification Step (ESSENTIAL for Top-Level Collection) ---
    if (!sprintData || sprintData.projectId !== projectId) {
      console.warn(
        `Attempt to access sprint ${sprintId} via incorrect project ${projectId}. Actual project: ${sprintData?.projectId}`
      );
      // Return 404 to prevent leaking info about sprint existence across projects.
      return res
        .status(404)
        .json({ message: "Sprint not found within the specified project" });
    }

    res.status(200).json({ id: sprintSnap.id, ...sprintData });
  } catch (error) {
    console.error(
      `Error getting sprint ${req.params.sprintId} for project ${req.params.projectId}:`,
      error
    );
    next(error);
  }
};

/**
 * @description Update the information in a spritn by its ID
 *              Fetches from the top-level 'sprints' collection and verifies projectId.
 * @route POST /api/v1/projects/:projectId/sprints/:sprintId
 * @access Private (requires auth, project membership)
 */
export const updateSprint: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, sprintId } = req.params;
    const { name, goal, startDate, endDate, status } = req.body;

    const sprintRef = db
      .collection("projects")
      .doc(projectId)
      .collection("sprints")
      .doc(sprintId);

    const sprintSnap = await sprintRef.get();

    if (!sprintSnap.exists) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    const sprintData = sprintSnap.data();

    if (!sprintData || sprintData.projectId !== projectId) {
      return res.status(403).json({
        message: "Sprint not found within the specified project",
      });
    }

    // --- Prepare updates ---
    const updates: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (name !== undefined) updates.name = name;
    if (goal !== undefined) updates.goal = goal;

    if (startDate !== undefined || endDate !== undefined) {
      const currentStart = startDate ? new Date(startDate) : sprintData.startDate.toDate();
      const currentEnd = endDate ? new Date(endDate) : sprintData.endDate.toDate();

      if (isNaN(currentStart.getTime()) || isNaN(currentEnd.getTime())) {
        return res.status(400).json({ message: "Invalid date format provided" });
      }

      if (currentStart >= currentEnd) {
        return res.status(400).json({ message: "startDate must be before endDate" });
      }

      if (startDate !== undefined) updates.startDate = Timestamp.fromDate(currentStart);
      if (endDate !== undefined) updates.endDate = Timestamp.fromDate(currentEnd);
    }

    if (status !== undefined) {
      const validStatuses = ["Active", "Planned", "Completed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      updates.status = status;
    }

    // --- Apply updates ---
    await sprintRef.update(updates);

    const updatedSnap = await sprintRef.get();
    res.status(200).json({ id: sprintId, ...updatedSnap.data() });
  } catch (error) {
    console.error(`Error updating sprint ${req.params.sprintId}:`, error);
    next(error);
  }
};


/**
 * @description Update the status of a sprint.
 * @route PATCH /api/v1/projects/:projectId/sprints/:sprintId/status
 * @access Private (requires auth, project membership, permissions)
 */

/**
 * @description Update the status of a sprint, ensuring only one active sprint per project.
 * @route PATCH /api/v1/projects/:projectId/sprints/:sprintId/status
 * @access Private (requires auth, project membership, permissions)
 */
export const updateSprintStatus: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, sprintId } = req.params;
    const { status } = req.body as { status: SprintStatus };

    // --- Input Validation ---
    if (!status || !["Active", "Planned", "Completed"].includes(status)) {
      return res.status(400).json({
        message: "Valid status (Active, Planned, or Completed) is required",
      });
    }

    const sprintRef = db
      .collection("projects")
      .doc(projectId)
      .collection("sprints")
      .doc(sprintId);

    const sprintSnap = await sprintRef.get();

    // --- Existence & Ownership Checks ---
    if (!sprintSnap.exists) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    const sprintData = sprintSnap.data();
    if (!sprintData || sprintData.projectId !== projectId) {
      return res.status(403).json({
        message: "Sprint not found within the specified project",
      });
    }

    // --- Status Transition Validation ---
    if (status === "Active") {
      // Check if there's already an active sprint
      const activeSprintSnap = await db
        .collection("sprints")
        .where("projectId", "==", projectId)
        .where("status", "==", "Active")
        .where("id", "!=", sprintId) // Exclude current sprint
        .limit(1)
        .get();

      if (!activeSprintSnap.empty) {
        return res.status(400).json({
          message: "Another sprint is already active for this project",
        });
      }
    }

    // --- Update Sprint Status ---
    await sprintRef.update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Fetch updated data
    const updatedSnap = await sprintRef.get();

    res.status(200).json({
      id: sprintId,
      ...updatedSnap.data(),
    });
  } catch (error) {
    console.error(
      `Error updating status for sprint ${req.params.sprintId}:`,
      error
    );
    next(error);
  }
};


/**
 * @description Delete a sprint from the project.
 *              Sprints are stored in a top-level 'sprints' collection.
 *              Deletes the complete sprint from the project by using the projectId and sprintId
 *              Determines initial status ('Active' or 'Planned') based on other sprints for the SAME project.
 * @route Delete /api/v1/projects/:projectId/sprints/_sprintId
 * @access Private (requires auth, project membership, permissions)
 */

export const deleteSprint:RequestHandler = async (req, res, next) => {
  try{
    const { projectId, sprintId } = req.params;

    const sprintRef = db
      .collection("projects")
      .doc(projectId)
      .collection("sprints")
      .doc(sprintId);

      const sprintSnap = await sprintRef.get();

      // --- Existence & Ownership Checks ---
    if (!sprintSnap.exists) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    const sprintData = sprintSnap.data();
    if (!sprintData || sprintData.projectId !== projectId) {
      return res.status(403).json({
        message: "Sprint not found within the specified project",
      });
    }

    await sprintRef.delete();

res.status(200).json({ message: `Sprint ${sprintId} successfully deleted` });

  } catch (error) {
    console.error(
      `Error deleting sprint ${req.params.sprintId}:`,
      error
    );
    next(error);
  }
};


/*

// POST /projects/:projectId/sprints/:sprintId/complete
export const completeSprint = async (req: Request, res: Response) => {
  try {
    const { projectId, sprintId } = req.params;

    // 1. Verificar que el sprint existe
    const sprintRef = db.collection("projectss").doc(projectId).collection("sprints").doc(sprintId);
    const sprintSnap = await sprintRef.get();
    
    if (!sprintSnap.exists) {
      res.status(404).json({ message: "Sprint no encontrado" });
      return;
    }

    const sprintData = sprintSnap.data();
    if (sprintData?.status === "completed") {
      res.status(400).json({ message: "El sprint ya está completado" });
      return;
    }

    // 2. Obtener todos los items del sprint para calcular métricas
    const itemsSnap = await sprintRef.collection("items").get();
    
    // 3. Calcular métricas de completitud
    const metrics: SprintCompletionMetrics = {
      totalItems: itemsSnap.size,
      completedItems: 0,
      itemsByStatus: {
        todo: 0,
        "in-progress": 0,
        review: 0,
        done: 0
      }
    };

    itemsSnap.forEach(doc => {
      const item = doc.data();
      metrics.itemsByStatus[item.status as SprintItemStatus]++;
      if (item.status === "done") {
        metrics.completedItems++;
      }
    });

    // 4. Actualizar el sprint como completado
    const now = Timestamp.now();
    await sprintRef.update({
      status: "completed",
      completedAt: now,
      completionMetrics: metrics,
      updatedAt: now
    });

    // 5. Devolver el sprint actualizado con sus métricas
    res.status(200).json({
      message: "Sprint completado exitosamente",
      completedAt: now,
      completionMetrics: metrics
    });

  } catch (error) {
    console.error("Error al completar el sprint:", error);
    res.status(500).json({ error: "Error interno al completar el sprint" });
  }
}; 
*/
