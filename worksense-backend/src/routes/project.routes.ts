// routes/projectRoutes.ts
import express from "express";
import * as projectController from "../controllers/project.controller.js";
import {
  auth,
  memberAuth,
  withPermission,
} from "../middlewares/projectMiddlewareBundle.js";
import backlogRouter from "./backlog.routes.js";
import membersRouter from "./members.routes.js";
import sprintsRouter from "./sprints.routes.js";
import taskRoutes from "./task.routes.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     authToken:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token for authentication
 *
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the project
 *         name:
 *           type: string
 *           description: Name of the project
 *         description:
 *           type: string
 *           description: Description of the project
 *         ownerId:
 *           type: integer
 *           description: ID of the project owner
 *         context:
 *           type: object
 *           properties:
 *             techStack:
 *               type: array
 *               items:
 *                 type: string
 *               description: List of technologies used in the project
 *             objectives:
 *               type: string
 *               description: Project objectives
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
 * tags:
 *   name: Projects
 *   description: Project management operations
 */

// Base authentication middleware

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: List all projects for the authenticated user
 *     tags: [Projects]
 *     security:
 *       - authToken: []
 *     responses:
 *       200:
 *         description: List of user's projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized - User is not authenticated
 */
router.get("/", auth, projectController.listUserProjects);

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - authToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the project
 *                 example: "Inventory Management System"
 *               description:
 *                 type: string
 *                 description: Description of the project
 *                 example: "Develop a new system to track warehouse inventory."
 *               context:
 *                 type: object
 *                 properties:
 *                   techStack:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of technologies to be used in the project
 *                     example: ["React", "Node.js", "PostgreSQL", "Firebase Auth"]
 *                   objectives:
 *                     type: string
 *                     description: Project objectives and goals
 *                     example: "Reduce stock discrepancies by 50% within 6 months."
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the created project
 *                   example: "echRFU49i8xDzOymJ0u9"
 *                 name:
 *                   type: string
 *                   description: Name of the project
 *                   example: "Inventory Management System"
 *                 description:
 *                   type: string
 *                   description: Description of the project
 *                   example: "Develop a new system to track warehouse inventory."
 *                 ownerId:
 *                   type: integer
 *                   description: ID of the project owner
 *                   example: 16
 *                 context:
 *                   type: object
 *                   properties:
 *                     techStack:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of technologies to be used in the project
 *                       example: ["React", "Node.js", "PostgreSQL", "Firebase Auth"]
 *                     objectives:
 *                       type: string
 *                       description: Project objectives and goals
 *                       example: "Reduce stock discrepancies by 50% within 6 months."
 *                 createdAt:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                       description: Unix timestamp in seconds
 *                       example: 1745807479
 *                     _nanoseconds:
 *                       type: integer
 *                       description: Nanoseconds part of the timestamp
 *                       example: 15000000
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 */
router.post("/", auth, projectController.createProject);

/**
 * @swagger
 * /projects/{projectId}:
 *   parameters:
 *     - in: path
 *       name: projectId
 *       required: true
 *       schema:
 *         type: string
 *       description: ID of the project
 *
 *   get:
 *     summary: Get project details by ID
 *     tags: [Projects]
 *     security:
 *       - authToken: []
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: Project not found
 *
 *   put:
 *     summary: Update project details
 *     tags: [Projects]
 *     security:
 *       - authToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the project
 *               description:
 *                 type: string
 *                 description: New description for the project
 *               context:
 *                 type: object
 *                 properties:
 *                   techStack:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of technologies used in the project
 *                   objectives:
 *                     type: string
 *                     description: Project objectives
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to edit the project
 *       404:
 *         description: Project not found
 *
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - authToken: []
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 projectId:
 *                   type: string
 *                   description: ID of the deleted project
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to delete the project
 *       404:
 *         description: Project not found
 */
router.get("/:projectId", memberAuth, projectController.getProjectDetails);

router.put(
  "/:projectId",
  withPermission("edit:project"),
  projectController.updateProject
);
router.delete(
  "/:projectId",
  withPermission("delete:project"),
  projectController.deleteProject
);

// Mount the sub-routers
router.use("/:projectId/backlog", backlogRouter);
router.use("/:projectId/members", membersRouter);
router.use("/:projectId/sprints", sprintsRouter);
router.use("/:projectId/tasks", taskRoutes);

export default router;
