// src/controllers/sprintController.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { db } from "../models/firebase.js"; // Adjust path if needed
import { FieldValue, Timestamp } from "firebase-admin/firestore";

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
