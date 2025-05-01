// src/controllers/sprintController.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { db } from "../models/firebase.js"; // Adjust path if needed
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { SprintStatus } from "../types/sprint.js";
// --- Sprint Management ---

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

    const sprintsCollection = db.collection("sprints"); // Top-level collection

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
    const sprintRef = db.collection("sprints").doc(sprintId);
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

    const sprintRef = db.collection("sprints").doc(sprintId);
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
