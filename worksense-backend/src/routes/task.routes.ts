// src/routes/task.routes.ts
import { Router } from "express";
import {
  createTask,
  getSprintTasks,
  updateTask,
  updateTaskStatus,
  removeTask,
  getTaskById,
} from "../controllers/task.controller.js";
import {
  auth,
  memberAuth,
  withPermission,
} from "../middlewares/projectMiddlewareBundle.js";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the task
 *         projectId:
 *           type: string
 *           description: ID of the project this task belongs to
 *         sprintId:
 *           type: string
 *           nullable: true
 *           description: ID of the sprint this task is assigned to
 *         backlogId:
 *           type: string
 *           description: ID of the original backlog item this task is derived from
 *         title:
 *           type: string
 *           description: Title of the task
 *         status:
 *           type: string
 *           enum: [todo, in-progress, review, done]
 *           description: Current status of the task
 *         priority:
 *           type: string
 *           nullable: true
 *           description: Priority of the task
 *         type:
 *           type: string
 *           description: Type of the task (e.g., Story, Bug, Task)
 *         assignees:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: User ID of the assignee
 *               name:
 *                 type: string
 *                 description: Display name of the assignee
 *               avatarUrl:
 *                 type: string
 *                 description: URL to the assignee's profile picture
 *         subtasksCompleted:
 *           type: integer
 *           description: Number of completed subtasks
 *         subtasksTotal:
 *           type: integer
 *           description: Total number of subtasks
 *         coverImageUrl:
 *           type: string
 *           nullable: true
 *           description: URL for the task's cover image
 *         startDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Start date of the task
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: End date of the task
 *         commentsCount:
 *           type: integer
 *           description: Number of comments on the task
 *         linksCount:
 *           type: integer
 *           description: Number of links/attachments on the task
 *         description:
 *           type: string
 *           nullable: true
 *           description: Detailed description of the task
 *         order:
 *           type: integer
 *           description: Order of the task within its column/sprint
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
 * /projects/{projectId}/sprints/{sprintId}/tasks:
 *   get:
 *     summary: Get all tasks for a specific sprint
 *     tags: [Tasks]
 *     security:
 *       - authToken: []
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
router.get("/sprints/:sprintId/tasks", memberAuth, getSprintTasks);

router.get("/:taskId", memberAuth, getTaskById);

/**
 * @swagger
 * /projects/{projectId}/tasks/{taskId}:
 *   get:
 *     summary: Get a specific task by ID
 *     tags: [Tasks]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: Task not found
 *
 *   patch:
 *     summary: Update a specific task
 *     tags: [Tasks]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, review, done]
 *                 description: New status of the task
 *               sprintAssigneeId:
 *                 type: integer
 *                 nullable: true
 *                 description: ID of the user to assign to the task
 *               order:
 *                 type: integer
 *                 description: New order of the task within its column
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to edit tasks
 *       404:
 *         description: Task not found
 *
 *   delete:
 *     summary: Delete a specific task
 *     tags: [Tasks]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 taskId:
 *                   type: string
 *                   description: ID of the deleted task
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to delete tasks
 *       404:
 *         description: Task not found
 */
router.patch("/:taskId", withPermission("manage:sprints"), updateTask);

/**
 * @swagger
 * /projects/{projectId}/tasks/{taskId}/status:
 *   patch:
 *     summary: Update the status of a specific task
 *     tags: [Tasks]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task
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
 *                 enum: [todo, in-progress, review, done]
 *                 description: New status of the task
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 taskId:
 *                   type: string
 *                   description: ID of the updated task
 *                 status:
 *                   type: string
 *                   description: New status of the task
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to update task status
 *       404:
 *         description: Task not found
 */
router.patch(
  "/:taskId/status",
  withPermission("manage:sprints"),
  updateTaskStatus
);

/**
 * @swagger
 * /projects/{projectId}/tasks/{taskId}:
 *   delete:
 *     summary: Delete a specific task
 *     tags: [Tasks]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 taskId:
 *                   type: string
 *                   description: ID of the deleted task
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to delete tasks
 *       404:
 *         description: Task not found
 */
router.delete("/:taskId", withPermission("edit:tasks"), removeTask);

export default router;
