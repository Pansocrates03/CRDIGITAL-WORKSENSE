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

router.get("/:taskId", memberAuth, getTaskById);

/**
 * @swagger
 * /projects/{projectId}/tasks/{taskId}:
 *   patch:
 *     summary: Update general details of a specific task within a project
 *     tags: [Tasks, Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: ID of the task to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               assignee:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.patch("/:taskId", withPermission("manage:sprints"), updateTask);

/**
 * @swagger
 * /projects/{projectId}/tasks/{taskId}/status:
 *   patch:
 *     summary: Update the status of a specific task within a project
 *     tags: [Tasks, Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: ID of the task to update
 *         schema:
 *           type: string
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
 *                 enum: [todo, in_progress, review, done]
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
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
 *     summary: Delete a specific task within a project
 *     tags: [Tasks, Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: ID of the task to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.delete("/:taskId", withPermission("edit:tasks"), removeTask);

export default router;
