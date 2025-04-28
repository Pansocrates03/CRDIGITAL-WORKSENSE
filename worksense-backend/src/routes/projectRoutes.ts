// routes/projectRoutes.ts
import express from "express";
import * as projectController from "../controllers/project.controller.js";
import * as memberController from "../controllers/member.controller.js";
import * as backlogController from "../controllers/backlog.controller.js";
import { verifyToken } from "../middlewares/tokenAuth.js";
import {
  checkProjectMembership,
  checkProjectPermission,
} from "../middlewares/projectAuth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management operations
 */

// Base authentication middleware
const auth = verifyToken;

// Project member middleware
const memberAuth = [verifyToken, checkProjectMembership];

// Permission-based middleware factories
const withPermission = (permission: string) => [
  verifyToken,
  checkProjectMembership,
  checkProjectPermission(permission),
];

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
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
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
 *               description:
 *                 type: string
 *                 description: Description of the project
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
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
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
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
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
 *     responses:
 *       200:
 *         description: Aggregated project data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project:
 *                   type: object
 *                 members:
 *                   type: array
 *                 backlogItems:
 *                   type: array
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
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
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
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to delete the project
 *       404:
 *         description: Project not found
 */
router.delete(
  "/:projectId",
  withPermission("delete:project"),
  projectController.deleteProject
);

/**
 * @swagger
 * tags:
 *   name: Project Members
 *   description: Project member management operations
 */

/**
 * @swagger
 * /{projectId}/members:
 *   get:
 *     summary: List all members of a project
 *     tags: [Project Members]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: List of project members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   roleId:
 *                     type: string
 *                   joinedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: Project not found
 */
router.get("/:projectId/members", memberAuth, memberController.listMembers);

/**
 * @swagger
 * /{projectId}/members-with-email:
 *   get:
 *     summary: List all members of a project with their email addresses
 *     tags: [Project Members]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: List of project members with email addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   email:
 *                     type: string
 *                   roleId:
 *                     type: string
 *                   joinedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: Project not found
 */
router.get(
  "/:projectId/members-with-email",
  memberAuth,
  memberController.listMembersWithEmail
);

/**
 * @swagger
 * /{projectId}/members:
 *   post:
 *     summary: Add a new member to the project
 *     tags: [Project Members]
 *     security:
 *       - authToken: []
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
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to add
 *               roleId:
 *                 type: string
 *                 description: ID of the role to assign to the user
 *     responses:
 *       201:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 roleId:
 *                   type: string
 *                 joinedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to manage members
 *       404:
 *         description: Project or user not found
 */
router.post(
  "/:projectId/members",
  withPermission("manage:members"),
  memberController.addMember
);

/**
 * @swagger
 * /{projectId}/members/{userId}:
 *   put:
 *     summary: Update a member's role in the project
 *     tags: [Project Members]
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
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: string
 *                 description: ID of the new role to assign to the user
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 roleId:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to manage members
 *       404:
 *         description: Project or user not found
 */
router.put(
  "/:projectId/members/:userId",
  withPermission("manage:members"),
  memberController.updateMemberRole
);

/**
 * @swagger
 * /{projectId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from the project
 *     tags: [Project Members]
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
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to manage members
 *       404:
 *         description: Project or user not found
 */
router.delete(
  "/:projectId/members/:userId",
  withPermission("manage:members"),
  memberController.removeMember
);

/**
 * @swagger
 * tags:
 *   name: Backlog Items
 *   description: Backlog item management operations
 */

/**
 * @swagger
 * /{projectId}/backlog/items:
 *   post:
 *     summary: Create a new backlog item
 *     tags: [Backlog Items]
 *     security:
 *       - authToken: []
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
 *               - type
 *               - title
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [epic, story, bug, task]
 *                 description: Type of backlog item
 *               title:
 *                 type: string
 *                 description: Title of the backlog item
 *               description:
 *                 type: string
 *                 description: Description of the backlog item
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 description: Priority of the backlog item
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, review, done]
 *                 description: Status of the backlog item
 *               assigneeId:
 *                 type: string
 *                 description: ID of the user assigned to the item
 *               parentId:
 *                 type: string
 *                 description: ID of the parent item (for sub-items)
 *     responses:
 *       201:
 *         description: Backlog item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 type:
 *                   type: string
 *                 title:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to edit the backlog
 *       404:
 *         description: Project not found
 */
router.post(
  "/:projectId/backlog/items",
  withPermission("edit:backlog"),
  backlogController.createBacklogItem
);

/**
 * @swagger
 * /{projectId}/backlog/items:
 *   get:
 *     summary: List all backlog items for a project
 *     tags: [Backlog Items]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [epic, story, bug, task]
 *         description: Filter by item type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, review, done]
 *         description: Filter by item status
 *     responses:
 *       200:
 *         description: List of backlog items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   type:
 *                     type: string
 *                   title:
 *                     type: string
 *                   status:
 *                     type: string
 *                   priority:
 *                     type: string
 *                   assigneeId:
 *                     type: string
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: Project not found
 */
router.get(
  "/:projectId/backlog/items",
  memberAuth,
  backlogController.listBacklogItems
);

/**
 * @swagger
 * /{projectId}/backlog/items/{itemId}:
 *   get:
 *     summary: Get a specific backlog item by ID
 *     tags: [Backlog Items]
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
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the backlog item
 *     responses:
 *       200:
 *         description: Backlog item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 type:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 assigneeId:
 *                   type: string
 *                 parentId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: Project or backlog item not found
 */
router.get(
  "/:projectId/backlog/items/:itemId",
  memberAuth,
  backlogController.getBacklogItem
);

/**
 * @swagger
 * /{projectId}/backlog/items/{itemId}:
 *   put:
 *     summary: Update a backlog item
 *     tags: [Backlog Items]
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
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the backlog item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: New title for the backlog item
 *               description:
 *                 type: string
 *                 description: New description for the backlog item
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 description: New priority for the backlog item
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, review, done]
 *                 description: New status for the backlog item
 *               assigneeId:
 *                 type: string
 *                 description: New assignee for the backlog item
 *     responses:
 *       200:
 *         description: Backlog item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to edit the backlog
 *       404:
 *         description: Project or backlog item not found
 */
router.put(
  "/:projectId/backlog/items/:itemId",
  withPermission("edit:backlog"),
  backlogController.updateBacklogItem
);

/**
 * @swagger
 * /{projectId}/backlog/items/{itemId}:
 *   delete:
 *     summary: Delete a backlog item
 *     tags: [Backlog Items]
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
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the backlog item
 *     responses:
 *       200:
 *         description: Backlog item deleted successfully
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to edit the backlog
 *       404:
 *         description: Project or backlog item not found
 */
router.delete(
  "/:projectId/backlog/items/:itemId",
  withPermission("edit:backlog"),
  backlogController.deleteBacklogItem
);

export default router;
