// src/routes/projectRoutes.ts
import express from "express";
import {
  createSprint,
  getSprints,
  getSprintById,
  updateSprint,
  updateSprintStatus,
  deleteSprint
} from "../controllers/sprint.controller.js";
import {
  memberAuth,
  withPermission,
} from "../middlewares/projectMiddlewareBundle.js";
import {
  createTask,
  getSprintTasks,
  getTaskById,
} from "../controllers/task.controller.js";

/*
import { Router } from "express";
import { createSprint, completeSprint } from "../controllers/sprint.controller.js";
import { addItemToSprint, getSprintBoard, updateSprintItem, removeSprintItem } from "../controllers/sprintItems.controller.js";
import { verifyToken } from "../middlewares/tokenAuth.js";
import { checkProjectMembership, checkProjectPermission } from "../middlewares/projectAuth.js";
*/

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     Sprint:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the sprint
 *         projectId:
 *           type: string
 *           description: ID of the project this sprint belongs to
 *         name:
 *           type: string
 *           description: Name of the sprint
 *         goal:
 *           type: string
 *           nullable: true
 *           description: Goal or objective of the sprint
 *         startDate:
 *           type: object
 *           properties:
 *             _seconds:
 *               type: integer
 *               description: Unix timestamp in seconds
 *             _nanoseconds:
 *               type: integer
 *               description: Nanoseconds part of the timestamp
 *         endDate:
 *           type: object
 *           properties:
 *             _seconds:
 *               type: integer
 *               description: Unix timestamp in seconds
 *             _nanoseconds:
 *               type: integer
 *               description: Nanoseconds part of the timestamp
 *         status:
 *           type: string
 *           enum: ["Active", "Planned", "Completed"]
 *           description: Current status of the sprint
 *         createdAt:
 *           type: object
 *           properties:
 *             _seconds:
 *               type: integer
 *               description: Unix timestamp in seconds
 *             _nanoseconds:
 *               type: integer
 *               description: Nanoseconds part of the timestamp
 *         updatedAt:
 *           type: object
 *           properties:
 *             _seconds:
 *               type: integer
 *               description: Unix timestamp in seconds
 *             _nanoseconds:
 *               type: integer
 *               description: Nanoseconds part of the timestamp
 */

/**
 * @swagger
 * /projects/{projectId}/sprints:
 *   post:
 *     summary: Create a new sprint
 *     tags: [Sprints]
 *     security:
 *       - auth-token: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the sprint (optional, will be auto-generated if not provided)
 *               goal:
 *                 type: string
 *                 description: Goal or objective of the sprint
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of the sprint
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date of the sprint
 *     responses:
 *       201:
 *         description: Sprint created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID of the created sprint
 *                 projectId:
 *                   type: string
 *                   description: ID of the project
 *                 name:
 *                   type: string
 *                   description: Name of the sprint
 *                 goal:
 *                   type: string
 *                   nullable: true
 *                   description: Goal of the sprint
 *                 startDate:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *                 endDate:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *                 status:
 *                   type: string
 *                   enum: ["Active", "Planned"]
 *                   description: Status will be "Active" if no other active sprint exists, otherwise "Planned"
 *                 createdAt:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *                 updatedAt:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *       400:
 *         description: Invalid request data (missing dates, invalid date format, or start date after end date)
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to create sprints
 */

router.post("/", withPermission("manage:sprints"), memberAuth, createSprint);


/**
 * @swagger
 * /projects/{projectId}/sprints:
 *   get:
 *     summary: Get all sprints of a project
 *     tags: [Sprints]
 *     security:
 *       - auth-token: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: List of sprints
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID of the sprint
 *                   projectId:
 *                     type: string
 *                     description: ID of the project
 *                   name:
 *                     type: string
 *                     description: Name of the sprint
 *                   goal:
 *                     type: string
 *                     nullable: true
 *                     description: Goal of the sprint
 *                   startDate:
 *                     type: object
 *                     properties:
 *                       _seconds:
 *                         type: integer
 *                       _nanoseconds:
 *                         type: integer
 *                   endDate:
 *                     type: object
 *                     properties:
 *                       _seconds:
 *                         type: integer
 *                       _nanoseconds:
 *                         type: integer
 *                   status:
 *                     type: string
 *                     enum: ["Active", "Planned", "Completed"]
 *                   createdAt:
 *                     type: object
 *                     properties:
 *                       _seconds:
 *                         type: integer
 *                       _nanoseconds:
 *                         type: integer
 *                   updatedAt:
 *                     type: object
 *                     properties:
 *                       _seconds:
 *                         type: integer
 *                       _nanoseconds:
 *                         type: integer
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: No sprints found for the specified project
 */

router.get("/", memberAuth, getSprints);


/**
 * @swagger
 * /projects/{projectId}/sprints/{sprintId}:
 *   get:
 *     summary: Get a specific sprint by ID
 *     tags: [Sprints]
 *     security:
 *       - auth-token: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the sprint
 *     responses:
 *       200:
 *         description: Sprint details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID of the sprint
 *                 projectId:
 *                   type: string
 *                   description: ID of the project
 *                 name:
 *                   type: string
 *                   description: Name of the sprint
 *                 goal:
 *                   type: string
 *                   nullable: true
 *                   description: Goal of the sprint
 *                 startDate:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *                 endDate:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *                 status:
 *                   type: string
 *                   enum: ["Active", "Planned", "Completed"]
 *                 createdAt:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *                 updatedAt:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *       400:
 *         description: Bad Request - sprintId parameter is required
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: Sprint not found or sprint does not belong to the specified project
 */
router.get("/:sprintId", memberAuth, getSprintById);

/**
 * @swagger
 * /projects/{projectId}/sprints/{sprintId}:
 *   patch:
 *     summary: Update an existing sprint
 *     tags: [Sprints]
 *     security:
 *       - auth-token: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project the sprint belongs to
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the sprint to update
 *     requestBody:
 *       description: Fields to update in the sprint (partial updates allowed)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the sprint
 *               goal:
 *                 type: string
 *                 nullable: true
 *                 description: Goal of the sprint
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Start date of the sprint (ISO format)
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: End date of the sprint (ISO format)
 *               status:
 *                 type: string
 *                 enum: [Active, Planned, Completed]
 *                 description: Status of the sprint
 *     responses:
 *       200:
 *         description: Sprint updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Sprint ID
 *                 projectId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 goal:
 *                   type: string
 *                   nullable: true
 *                 startDate:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *                 endDate:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *                 status:
 *                   type: string
 *                   enum: [Active, Planned, Completed]
 *                 createdAt:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *                 updatedAt:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *       400:
 *         description: Bad request – invalid date format or invalid status
 *       401:
 *         description: Unauthorized – authentication required
 *       403:
 *         description: Forbidden – sprint does not belong to specified project
 *       404:
 *         description: Sprint not found
 */

router.post("/:sprintId", withPermission("manage:sprints"), memberAuth, updateSprint);


/**
 * @swagger
 * /projects/{projectId}/sprints/{sprintId}:
 *   delete:
 *     summary: Delete a sprint from the project
 *     tags: [Sprints]
 *     security:
 *       - auth-token: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the sprint
 *     responses:
 *       200:
 *         description: Sprint deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sprint sprint123 successfully deleted
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - Sprint does not belong to the specified project
 *       404:
 *         description: Sprint not found
 */
router.delete("/:sprintId", withPermission("manage:sprints"), memberAuth, deleteSprint);

/**
 * @swagger
 * /projects/{projectId}/sprints/{sprintId}/status:
 *   patch:
 *     summary: Update the status of a sprint
 *     tags: [Sprints]
 *     security:
 *       - auth-token: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the sprint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["Active", "Planned", "Completed"]
 *                 description: New status of the sprint
 *     responses:
 *       200:
 *         description: Sprint status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID of the sprint
 *                 projectId:
 *                   type: string
 *                   description: ID of the project
 *                 name:
 *                   type: string
 *                   description: Name of the sprint
 *                 goal:
 *                   type: string
 *                   nullable: true
 *                   description: Goal of the sprint
 *                 startDate:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *                 endDate:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *                 status:
 *                   type: string
 *                   enum: ["Active", "Planned", "Completed"]
 *                 createdAt:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *                 updatedAt:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                     _nanoseconds:
 *                       type: integer
 *       400:
 *         description: Invalid request data (invalid status) or another sprint is already active
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to update sprint status
 *       404:
 *         description: Sprint not found or sprint does not belong to the specified project
 */
router.post("/:sprintId/status", withPermission("manage:sprints"), memberAuth, updateSprintStatus)

/**
 * @swagger
 * /projects/{projectId}/sprints/{sprintId}/tasks/{taskId}:
 *   post:
 *     summary: Add a task to a sprint
 *     tags: [Sprints, Tasks]
 *     security:
 *       - auth-token: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the sprint
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
 *                 description: Type of the task
 *               originalId:
 *                 type: string
 *                 description: ID of the original backlog item
 *               originalType:
 *                 type: string
 *                 description: Type of the original backlog item
 *     responses:
 *       201:
 *         description: Task added to sprint successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to add tasks to sprint
 *       404:
 *         description: Sprint not found
 *
 *   get:
 *     summary: Get all tasks in a sprint
 *     tags: [Sprints, Tasks]
 *     security:
 *       - auth-token: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *       - in: path
 *         name: sprintId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the sprint
 *     responses:
 *       200:
 *         description: List of tasks in the sprint
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: Sprint not found
 */

// router.post("/:sprintId/tasks/:taskId", memberAuth, updateTaskSprint);

export default router;
/*
/**
 * @swagger
 * /projectss/{projectId}/sprints/{sprintId}/complete:
 *   post:
 *     summary: Marcar un sprint como completado
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: sprintId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sprint marcado como completado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 completedAt:
 *                   type: object
 *                 completionMetrics:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: number
 *                     completedItems:
 *                       type: number
 *                     itemsByStatus:
 *                       type: object
 *       400:
 *         description: El sprint ya está completado
 *       404:
 *         description: Sprint no encontrado
 */
/*
router.post(
  "/projectss/:projectId/sprints/:sprintId/complete",
  verifyToken,
  checkProjectMembership,
  checkProjectPermission("manage:sprints"),
  completeSprint
);

export default router; 
*/
