// src/routes/projectRoutes.ts
import express from "express";
import {
  createSprint,
  getSprints,
  getSprintById,
} from "../controllers/sprint.controller.js";
import {
  memberAuth,
  withPermission,
} from "../middlewares/projectMiddlewareBundle.js";
import { createTask, getSprintTasks } from "../controllers/task.controller.js";

const router = express.Router({ mergeParams: true });

// --- Sprint Routes ---

/**
 * @swagger
 * /sprints:
 *   post:
 *     summary: Create a new sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
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
router.post("/", withPermission("manage:sprints"), createSprint);

/**
 * @swagger
 * /sprints:
 *   get:
 *     summary: Get all sprints
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
router.get("/", memberAuth, getSprints);

/**
 * @swagger
 * /sprints/{sprintId}:
 *   get:
 *     summary: Get a single sprint by its ID
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
router.get("/:sprintId", memberAuth, getSprintById);

/**
 * @swagger
 * /sprints/{sprintId}/tasks:
 *   post:
 *     summary: Add a backlog item as a task to a specific sprint
 *     tags: [Tasks, Sprints]
 *     description: Creates a new task document linked to the specified sprint, based on a backlog item.
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *               - type
 *               - originalId
 *               - originalType
 *             properties:
 *               type:
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
 */
router.post("/:sprintId/tasks", withPermission("manage:sprints"), createTask);

/**
 * @swagger
 * /sprints/{sprintId}/tasks:
 *   get:
 *     summary: Get all tasks in a sprint
 *     tags: [Tasks, Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Sprint not found
 */
router.get("/:sprintId/tasks", memberAuth, getSprintTasks);

export default router;
