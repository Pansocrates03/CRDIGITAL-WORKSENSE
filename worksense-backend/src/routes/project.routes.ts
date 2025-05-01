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
 * tags:
 *   name: Projects
 *   description: Project management operations
 */

// Base authentication middleware

/**
 * @swagger
 * /:
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
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier for the project
 *                     example: "proj_abc123"
 *                   ownerId:
 *                     type: integer
 *                     description: ID of the project owner
 *                     example: 16
 *                   name:
 *                     type: string
 *                     description: Name of the project
 *                     example: "changedName Platform Enhancements"
 *                   description:
 *                     type: string
 *                     description: Description of the project
 *                     example: "There is none because i changed it"
 *                   context:
 *                     type: object
 *                     properties:
 *                       techStack:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: List of technologies used in the project
 *                         example: ["React"]
 *                       objectives:
 *                         type: string
 *                         description: Project objectives
 *                         example: ""
 *                   createdAt:
 *                     type: object
 *                     properties:
 *                       _seconds:
 *                         type: integer
 *                         description: Unix timestamp in seconds
 *                         example: 1745715508
 *                       _nanoseconds:
 *                         type: integer
 *                         description: Nanoseconds part of the timestamp
 *                         example: 392000000
 *                   updatedAt:
 *                     type: object
 *                     properties:
 *                       _seconds:
 *                         type: integer
 *                         description: Unix timestamp in seconds
 *                         example: 1745788678
 *                       _nanoseconds:
 *                         type: integer
 *                         description: Nanoseconds part of the timestamp
 *                         example: 523000000
 *       401:
 *         description: Unauthorized - User is not authenticated
 */
router.get("/", auth, projectController.listUserProjects);

/**
 * @swagger
 * /:
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
 * /{projectId}:
 *   get:
 *     summary: Get project details by ID
 *     tags: [Projects]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *         example: "echRFU49i8xDzOymJ0u9"
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Unique identifier for the project
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
 *                       description: List of technologies used in the project
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
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: Project not found
 */
router.get("/:projectId", memberAuth, projectController.getProjectDetails);

/**
 * @swagger
 * /{projectId}/data:
 *   get:
 *     summary: Get aggregated project data
 *     tags: [Projects]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *         example: "proj_abc123"
 *     responses:
 *       200:
 *         description: Aggregated project data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project:
 *                   $ref: '#/components/schemas/Project'
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: integer
 *                         description: ID of the user
 *                         example: 16
 *                       projectRoleId:
 *                         type: string
 *                         description: Role of the user in the project
 *                         example: "product-owner"
 *                       joinedAt:
 *                         type: object
 *                         properties:
 *                           _seconds:
 *                             type: integer
 *                             description: Unix timestamp in seconds
 *                             example: 1745715722
 *                           _nanoseconds:
 *                             type: integer
 *                             description: Nanoseconds part of the timestamp
 *                             example: 754000000
 *                       name:
 *                         type: string
 *                         description: Full name of the user
 *                         example: "prueba16 prueba16"
 *                       email:
 *                         type: string
 *                         description: Email address of the user
 *                         example: "prueba16@email.com"
 *                 backlog:
 *                   type: object
 *                   properties:
 *                     epics:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Epic'
 *                     stories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Story'
 *                     bugs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Bug'
 *                     techTasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TechTask'
 *                     knowledge:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Knowledge'
 *                 userPermissions:
 *                   type: array
 *                   description: List of permissions granted to the current user based on their role
 *                   items:
 *                     type: string
 *                   example: ["view:project", "edit:backlog", "manage:sprints"]
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: Project not found
 */
router.get(
  "/:projectId/data",
  memberAuth,
  projectController.getProjectAggregatedData
);

/**
 * @swagger
 * /{projectId}:
 *   put:
 *     summary: Update project details
 *     tags: [Projects]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *         example: "proj_abc123"
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
 *                 example: "Updated Project Name"
 *               description:
 *                 type: string
 *                 description: New description for the project
 *                 example: "Updated project description"
 *               context:
 *                 type: object
 *                 properties:
 *                   techStack:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: List of technologies used in the project
 *                     example: ["React", "Node.js", "Firebase"]
 *                   objectives:
 *                     type: string
 *                     description: Project objectives
 *                     example: "Complete the MVP by Q2 2024"
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
 */
router.put(
  "/:projectId",
  withPermission("edit:project"),
  projectController.updateProject
);

/**
 * @swagger
 * /{projectId}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project to delete
 *         example: "proj_abc123"
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
 *                   example: "Project deleted successfully"
 *                 projectId:
 *                   type: string
 *                   description: ID of the deleted project
 *                   example: "proj_abc123"
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to delete the project
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Project not found"
 */
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
