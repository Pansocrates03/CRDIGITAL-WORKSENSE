// src/routes/projectRoutes.ts
import { Router } from "express";
import {
  createSprint,
  getSprints,
  getSprintById,
} from "../controllers/sprint.controller.js"; // Corrected path if needed

import { verifyToken } from "../middlewares/tokenAuth.js";
import {
  checkProjectMembership,
  checkProjectPermission,
} from "../middlewares/projectAuth.js";
import {
  addItemToSprint,
  getSprintTasks,
} from "../controllers/task.controller.js";

const router = Router();

// --- Sprint Routes (All under /:projectId) ---

/**
 * @swagger
 * /{projectId}/sprints:
 *   post:
 *     summary: Create a new sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startDate, endDate]
 *             properties:
 *               name:
 *                 type: string
 *                 description: Optional name for the sprint
 *               goal:
 *                 type: string
 *                 description: Optional goal for the sprint
 *               startDate:
 *                 type: string
 *                 format: date-string
 *                 description: Start date (e.g., YYYY-MM-DD or ISO format)
 *               endDate:
 *                 type: string
 *                 format: date-string
 *                 description: End date (e.g., YYYY-MM-DD or ISO format)
 *     responses:
 *       '201':
 *         description: Sprint created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *       '400':
 *         description: Validation error (missing fields, invalid dates, overlap)
 *       '401':
 *         description: Unauthorized (Token missing or invalid)
 *       '403':
 *         description: Forbidden (User lacks permission)
 *       '500':
 *         description: Internal server error
 */
router.post(
  "/:projectId/sprints",
  verifyToken,
  checkProjectMembership,
  checkProjectPermission("manage:sprints"),
  createSprint
);

/**
 * @swagger
 * /{projectId}/sprints:
 *   get:
 *     summary: Get all sprints
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         required: false
 *         description: Filter sprints by status (e.g., Planned, Active). Can provide multiple times for 'in' query.
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [Planned, Active, Completed]
 *     responses:
 *       '200':
 *         description: List of sprints retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   goal:
 *                     type: string
 *                     nullable: true
 *                   startDate:
 *                     type: object
 *                   endDate:
 *                     type: object
 *                   status:
 *                     type: string
 *       '400':
 *         description: Invalid request
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '500':
 *         description: Internal server error
 */
router.get(
  "/:projectId/sprints",
  verifyToken,
  checkProjectMembership,
  getSprints
);

/**
 * @swagger
 * /{projectId}/sprints/{sprintId}:
 *   get:
 *     summary: Get a single sprint by its ID
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *       - name: sprintId
 *         in: path
 *         required: true
 *         description: ID of the sprint to fetch
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Sprint details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 goal:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date-string
 *                 endDate:
 *                   type: string
 *                   format: date-string
 *                 status:
 *                   type: string
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Sprint not found
 *       '500':
 *         description: Internal server error
 */
router.get(
  "/:projectId/sprints/:sprintId",
  verifyToken,
  checkProjectMembership,
  getSprintById
);

/**
 * @swagger
 * /projects/{projectId}/sprints/{sprintId}/tasks:
 *   post:
 *     summary: Add a backlog item as a task to a specific sprint
 *     tags: [Tasks, Sprints, Projects]
 *     description: Creates a new task document linked to the specified project and sprint, based on a backlog item.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *       - name: sprintId
 *         in: path
 *         required: true
 *         description: ID of the sprint to add the task to
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - backlogItemId
 *             properties:
 *               backlogItemId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task added to sprint successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project, sprint, or backlog item not found
 */
router.post(
  "/:projectId/sprints/:sprintId/tasks",
  verifyToken,
  checkProjectMembership,
  checkProjectPermission("manage:sprints"),
  addItemToSprint
);

/**
 * @swagger
 * /projects/{projectId}/sprints/{sprintId}/tasks:
 *   get:
 *     summary: Get all tasks for a specific sprint within a project
 *     tags: [Tasks, Sprints, Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *       - name: sprintId
 *         in: path
 *         required: true
 *         description: ID of the sprint
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks in the sprint
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Project or sprint not found
 */
router.get(
  "/:projectId/sprints/:sprintId/tasks",
  verifyToken,
  checkProjectMembership,
  getSprintTasks
);

export default router;
