// src/controllers/sprintController.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import { db } from "../models/firebase.js"; // Adjust path if needed
import { FieldValue, Timestamp } from "firebase-admin/firestore";
// Types are likely not needed directly in this file anymore if defined elsewhere
// import { CreateSprintItemDTO, UpdateSprintItemDTO } from "../../types/sprint.js";
// import { getItemRef } from "../utils/helpers/firestoreHelpers.js";

// --- Sprint Management ---

/**
 * Create a new sprint for a project.
 * Determines status based on existing active sprints.
 * Associated Route: POST /api/projects/:projectId/sprints
 */
export const createSprint: RequestHandler = async (req, res, next) => {
  try {
    // projectId comes from the path parameter, assured by the route definition
    const { projectId } = req.params;
    // No need for explicit check here if routing handles missing param, but good practice:
    if (!projectId) {
      // Should ideally not be reached if route is defined as /:projectId/sprints
      return res.status(400).json({
        message: "Programming Error: projectId missing in parameters",
      });
    }

    const { name, goal, startDate, endDate } = req.body;
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

    const sprintsRef = db
      .collection("projects")
      .doc(projectId)
      .collection("sprints");

    // Check if there's already an active sprint for *this specific project*
    const activeSprintSnap = await sprintsRef
      .where("projectId", "==", projectId) // Filter by project from params
      .where("status", "==", "Active")
      .limit(1)
      .get();

    const newSprintStatus = activeSprintSnap.empty ? "Active" : "Planned";

    // --- Date Overlap Check ---
    // WARNING: This check remains simplified due to Firestore query limitations.
    // For robust overlap prevention, consider fetching relevant sprints
    // (e.g., Planned/Active for the projectId) and performing checks in Node.js.
    const potentialOverlapQuery = sprintsRef
      .where("projectId", "==", projectId)
      // Query constraints that *might* overlap - difficult to cover all cases efficiently
      // Example: Checking sprints ending after the new one starts
      .where("endDate", ">=", Timestamp.fromDate(newStart));
    // Needs further filtering in backend code based on startDate <= newEnd

    // Example of fetching and checking in backend (can be slow with many sprints):
    const potentialOverlapsSnap = await potentialOverlapQuery.get();
    let isOverlapping = false;
    potentialOverlapsSnap.forEach((doc) => {
      const existingSprint = doc.data();
      const existingStart = existingSprint.startDate.toDate();
      const existingEnd = existingSprint.endDate.toDate();
      // Actual overlap condition: (StartA <= EndB) and (EndA >= StartB)
      if (newStart <= existingEnd && newEnd >= existingStart) {
        isOverlapping = true;
      }
    });

    if (isOverlapping) {
      console.warn(
        `Overlap detected for project ${projectId} with dates ${startDate} - ${endDate}`
      );
      return res.status(400).json({
        message:
          "Sprint dates overlap with an existing sprint for this project.",
      });
    }
    // --- End Date Overlap Check ---

    // Create sprint data (projectId comes from params)
    const sprintData = {
      projectId,
      name: name || `Sprint ${newStart.toLocaleDateString()}`,
      goal: goal || null,
      startDate: Timestamp.fromDate(newStart),
      endDate: Timestamp.fromDate(newEnd),
      status: newSprintStatus,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const sprintRef = await sprintsRef.add(sprintData);
    const newSprintSnap = await sprintRef.get();

    res.status(201).json({ id: sprintRef.id, ...newSprintSnap.data() });
  } catch (error) {
    console.error(
      `Error creating sprint for project ${req.params.projectId}:`,
      error
    );
    next(error || new Error("Internal server error while creating sprint"));
  }
};

/**
 * Get sprints for a specific project, optionally filtered by status.
 * Associated Route: GET /api/projects/:projectId/sprints(?status=Planned&status=Active)
 */
export const getSprints: RequestHandler = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      // Should not be reached if route is defined as /:projectId/sprints
      return res.status(400).json({
        message: "Programming Error: projectId missing in parameters",
      });
    }
    const { status } = req.query;

    let query = db.collection("sprints").where("projectId", "==", projectId);

    if (status) {
      const statusArray = Array.isArray(status) ? status : [status as string];
      // Optional: Add validation for allowed status values
      query = query.where("status", "in", statusArray);
    }

    // Order by most recent end date first is common, or by start date asc
    query = query.orderBy("endDate", "desc");
    // You might need composite indexes in Firestore depending on filters/orders

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
    next(error || new Error("Internal server error while fetching sprints"));
  }
};

/**
 * Get a single sprint by its ID, ensuring it belongs to the specified project.
 * Associated Route: GET /api/projects/:projectId/sprints/:sprintId
 */
export const getSprintById: RequestHandler = async (req, res, next) => {
  try {
    const { projectId, sprintId } = req.params;

    if (!projectId || !sprintId) {
      return res
        .status(400)
        .json({ message: "projectId and sprintId parameters are required" });
    }

    const sprintRef = db.collection("sprints").doc(sprintId);
    const sprintSnap = await sprintRef.get();

    if (!sprintSnap.exists) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    const sprintData = sprintSnap.data();

    // --- Verification Step ---
    // Check if the fetched sprint actually belongs to the project specified in the URL
    if (sprintData?.projectId !== projectId) {
      console.warn(
        `Attempt to access sprint ${sprintId} via incorrect project ${projectId}. Actual project: ${sprintData?.projectId}`
      );
      // Return 404 (Not Found) rather than 403 (Forbidden) to avoid revealing sprint existence across projects
      return res
        .status(404)
        .json({ message: "Sprint not found within the specified project" });
    }
    // --- End Verification ---

    res.status(200).json({ id: sprintSnap.id, ...sprintData });
  } catch (error) {
    console.error(
      `Error getting sprint ${req.params.sprintId} for project ${req.params.projectId}:`,
      error
    );
    next(error || new Error("Internal server error while fetching sprint"));
  }
};

// Note: The task-related controllers (addItemToSprint, getSprintTasks, updateTask, etc.)
// should reside in their own controller file (e.g., taskController.ts)
// but were modified previously to expect projectId from req.params as well.
