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
export const memberAuth = [verifyToken, checkProjectMembership];

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
 *         example: "proj_abc123"
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
 *                     type: integer
 *                     description: ID of the user
 *                     example: 16
 *                   projectRoleId:
 *                     type: string
 *                     description: Role of the user in the project
 *                     example: "product-owner"
 *                   joinedAt:
 *                     type: object
 *                     properties:
 *                       _seconds:
 *                         type: integer
 *                         description: Unix timestamp in seconds
 *                         example: 1745715722
 *                       _nanoseconds:
 *                         type: integer
 *                         description: Nanoseconds part of the timestamp
 *                         example: 754000000
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
 *         example: "proj_abc123"
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
 *                     type: integer
 *                     description: ID of the user
 *                     example: 16
 *                   projectRoleId:
 *                     type: string
 *                     description: Role of the user in the project
 *                     example: "product-owner"
 *                   joinedAt:
 *                     type: object
 *                     properties:
 *                       _seconds:
 *                         type: integer
 *                         description: Unix timestamp in seconds
 *                         example: 1745715722
 *                       _nanoseconds:
 *                         type: integer
 *                         description: Nanoseconds part of the timestamp
 *                         example: 754000000
 *                   name:
 *                     type: string
 *                     description: Full name of the user
 *                     example: "prueba16 prueba16"
 *                   email:
 *                     type: string
 *                     description: Email address of the user
 *                     example: "prueba16@email.com"
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: Project not found
 */
router.get(
  "/:projectId/membersDetail",
  memberAuth,
  memberController.listMembersDetail
);

/**
 * @swagger
 *   post:
 *     summary: Add a new member to the project
 *     description: |
 *       Add a new member to the project with a specific role.
 *
 *       The user making the request must have the `manage:members` permission for the project.
 *       The `userId` must exist in the SQL database and the `projectRoleId` must exist in the Firestore `/projectRoles` collection.
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
 *         example: "proj_abc123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - projectRoleId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: Numeric SQL User ID of the user to add to the project
 *                 example: 102
 *               projectRoleId:
 *                 type: string
 *                 description: Firestore Document ID of the role to assign to the user
 *                 example: "developer"
 *           examples:
 *             developer:
 *               summary: Adding a developer
 *               value:
 *                 userId: 102
 *                 projectRoleId: "developer"
 *             viewer:
 *               summary: Adding a viewer
 *               value:
 *                 userId: 103
 *                 projectRoleId: "viewer"
 *             customRole:
 *               summary: Adding with custom role ID
 *               value:
 *                 userId: 105
 *                 projectRoleId: "role_xyz987"
 *     responses:
 *       201:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   description: ID of the added user
 *                   example: 102
 *                 projectRoleId:
 *                   type: string
 *                   description: Role assigned to the user
 *                   example: "developer"
 *                 joinedAt:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                       description: Unix timestamp in seconds
 *                       example: 1745715722
 *                     _nanoseconds:
 *                       type: integer
 *                       description: Nanoseconds part of the timestamp
 *                       example: 754000000
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
 *     description: |
 *       Update the role of an existing project member.
 *
 *       The user making the request must have the `manage:members` permission for the project.
 *       The `projectRoleId` must exist in the Firestore `/projectRoles` collection.
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
 *         example: "proj_abc123"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user whose role is being updated
 *         example: 102
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectRoleId
 *             properties:
 *               projectRoleId:
 *                 type: string
 *                 description: Firestore Document ID of the new role to assign to the user
 *                 example: "developer"
 *           examples:
 *             toDeveloper:
 *               summary: Change to developer role
 *               value:
 *                 projectRoleId: "developer"
 *             toViewer:
 *               summary: Change to viewer role
 *               value:
 *                 projectRoleId: "viewer"
 *             toCustomRole:
 *               summary: Change to custom role
 *               value:
 *                 projectRoleId: "role_xyz987"
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   description: ID of the user
 *                   example: 102
 *                 projectRoleId:
 *                   type: string
 *                   description: New role assigned to the user
 *                   example: "developer"
 *                 updatedAt:
 *                   type: object
 *                   properties:
 *                     _seconds:
 *                       type: integer
 *                       description: Unix timestamp in seconds
 *                       example: 1745715722
 *                     _nanoseconds:
 *                       type: integer
 *                       description: Nanoseconds part of the timestamp
 *                       example: 754000000
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
 *     description: |
 *       Remove a user from the project members.
 *
 *       The user making the request must have the `manage:members` permission for the project.
 *       The project owner cannot be removed from the project.
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
 *         example: "proj_abc123"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to remove from the project
 *         example: 102
 *     responses:
 *       200:
 *         description: Member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Member removed successfully"
 *                 userId:
 *                   type: integer
 *                   description: ID of the removed user
 *                   example: 102
 *                 projectId:
 *                   type: string
 *                   description: ID of the project
 *                   example: "proj_abc123"
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to manage members or trying to remove project owner
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
 *     description: |
 *       Create a new backlog item (epic, story, bug, tech task, or knowledge item) in the project.
 *       The type field determines which additional fields are required/optional.
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
 *         example: "proj_abc123"
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
 *                 enum: [epic, story, bug, techTask, knowledge]
 *                 description: Type of backlog item
 *                 example: "story"
 *               title:
 *                 type: string
 *                 description: Title of the backlog item
 *                 example: "User Login with Email/Password"
 *               description:
 *                 type: string
 *                 description: Description of the backlog item
 *                 example: "As a user, I want to log in using my email and password."
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, highest]
 *                 description: Priority of the backlog item
 *                 example: "high"
 *               status:
 *                 type: string
 *                 enum: [new, todo, refining, in-progress, review, done, active]
 *                 description: Status of the backlog item
 *                 example: "todo"
 *               epicId:
 *                 type: string
 *                 description: ID of the parent epic (for stories)
 *                 example: "epic_001"
 *               storyPoints:
 *                 type: integer
 *                 description: Story points estimate (for stories)
 *                 example: 5
 *               linkedStoryId:
 *                 type: string
 *                 description: ID of the linked story (for bugs and tech tasks)
 *                 example: "story_001"
 *               severity:
 *                 type: string
 *                 enum: [minor, major, critical]
 *                 description: Severity level (for bugs)
 *               content:
 *                 type: string
 *                 description: Content of the knowledge item
 *                 example: "Decided on JWT-based auth with 1-hour expiry."
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for knowledge items
 *                 example: ["auth", "decision"]
 *           examples:
 *             epic:
 *               summary: Creating an epic
 *               value:
 *                 type: "epic"
 *                 title: "User Authentication Module"
 *                 description: "Implement complete user login, registration, and profile management."
 *                 priority: "high"
 *                 status: "new"
 *             story:
 *               summary: Creating a story
 *               value:
 *                 type: "story"
 *                 title: "User Login with Email/Password"
 *                 description: "As a user, I want to log in using my email and password."
 *                 epicId: "epic_001"
 *                 priority: "high"
 *                 storyPoints: 5
 *                 status: "todo"
 *             bug:
 *               summary: Creating a bug
 *               value:
 *                 type: "bug"
 *                 title: "Login button unresponsive on Safari"
 *                 description: "Steps: 1. Open on Safari 15. 2. Enter credentials. 3. Click Login."
 *                 linkedStoryId: "story_001"
 *                 priority: "high"
 *                 severity: "major"
 *                 status: "new"
 *             techTask:
 *               summary: Creating a tech task
 *               value:
 *                 type: "techTask"
 *                 title: "Set up Firestore indexing"
 *                 description: "Define and deploy necessary composite indexes."
 *                 linkedStoryId: "story_001"
 *                 priority: "medium"
 *                 status: "todo"
 *             knowledge:
 *               summary: Creating a knowledge item
 *               value:
 *                 type: "knowledge"
 *                 title: "Decision Log: Authentication Flow"
 *                 content: "Decided on JWT-based auth with 1-hour expiry."
 *                 tags: ["auth", "decision"]
 *                 status: "active"
 *     responses:
 *       201:
 *         description: Backlog item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Epic'
 *                 - $ref: '#/components/schemas/Story'
 *                 - $ref: '#/components/schemas/Bug'
 *                 - $ref: '#/components/schemas/TechTask'
 *                 - $ref: '#/components/schemas/Knowledge'
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
 *     description: |
 *       Retrieve all backlog items (epics, stories, bugs, tech tasks, and knowledge items) for a project.
 *       Items are returned in a flat array, with each item containing its specific type and related fields.
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
 *         example: "proj_abc123"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [epic, story, bug, techTask, knowledge]
 *         description: Filter by item type
 *         example: "story"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, todo, refining, in-progress, review, done, active]
 *         description: Filter by item status
 *         example: "todo"
 *     responses:
 *       200:
 *         description: List of backlog items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/Epic'
 *                   - $ref: '#/components/schemas/Story'
 *                   - $ref: '#/components/schemas/Bug'
 *                   - $ref: '#/components/schemas/TechTask'
 *                   - $ref: '#/components/schemas/Knowledge'
 *               example:
 *                 - id: "epic_001"
 *                   projectId: "proj_abc123"
 *                   type: "epic"
 *                   title: "User Authentication Module"
 *                   description: "Implement complete user login, registration, and profile management."
 *                   priority: "high"
 *                   reporterId: "101"
 *                   assigneeId: null
 *                   status: "new"
 *                   createdAt:
 *                     _seconds: 1745792338
 *                     _nanoseconds: 635000000
 *                   updatedAt:
 *                     _seconds: 1745792352
 *                     _nanoseconds: 683000000
 *                   linkedItems: null
 *                 - id: "story_001"
 *                   projectId: "proj_abc123"
 *                   type: "story"
 *                   title: "User Login with Email/Password"
 *                   description: "As a user, I want to log in using my email and password."
 *                   epicId: "epic_001"
 *                   priority: "highest"
 *                   storyPoints: 5
 *                   reporterId: 16
 *                   assigneeId: 17
 *                   status: "todo"
 *                   createdAt:
 *                     _seconds: 1745792542
 *                     _nanoseconds: 435000000
 *                   linkedItems: null
 *                 - id: "bug001"
 *                   projectId: "proj_abc123"
 *                   type: "bug"
 *                   title: "Login button unresponsive on Safari"
 *                   description: "Steps: 1. Open on Safari 15. 2. Enter credentials. 3. Click Login. Expected: Login proceeds. Actual: Nothing happens."
 *                   linkedStoryId: "story_001"
 *                   priority: "high"
 *                   severity: "major"
 *                   reporterId: 18
 *                   assigneeId: 17
 *                   status: "confirmed"
 *                   createdAt:
 *                     _seconds: 1745792917
 *                     _nanoseconds: 903000000
 *                   UpdatedAt:
 *                     _seconds: 1745792931
 *                     _nanoseconds: 104000000
 *                   linkedItems: null
 *                 - id: "task_001"
 *                   projectId: "proj_abc123"
 *                   type: "techTask"
 *                   title: "set up Firestore indexing for backlog queries"
 *                   description: "Define and deploy necessary composite indexes for filtering/sorting the backlog."
 *                   linkedStoryId: null
 *                   priority: "medium"
 *                   reporterId: 16
 *                   assigneeId: 16
 *                   status: "todo"
 *                   createdAt:
 *                     _seconds: 1745793050
 *                     _nanoseconds: 570000000
 *                   updatedAt:
 *                     _seconds: 1745793061
 *                     _nanoseconds: 218000000
 *                   linkedItems: null
 *                 - id: "know_001"
 *                   projectId: "proj_abc123"
 *                   type: "knowledge"
 *                   title: "Decision Log: Authentication Flow"
 *                   content: "Decided on JWT-based auth with 1-hour expiry. Role included in payload."
 *                   tags: ["auth", "decision"]
 *                   reporterId: 16
 *                   assigneeId: null
 *                   status: "active"
 *                   createdAt:
 *                     _seconds: 1745793184
 *                     _nanoseconds: 787000000
 *                   updatedAt:
 *                     _seconds: 1745793193
 *                     _nanoseconds: 405000000
 *                   linkedItems: null
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
 *     description: |
 *       Update an existing backlog item. The updateable fields depend on the item type.
 *       The type field cannot be changed after creation.
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
 *         example: "proj_abc123"
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the backlog item
 *         example: "story_001"
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
 *                 example: "Updated User Login Story"
 *               description:
 *                 type: string
 *                 description: New description for the backlog item
 *                 example: "As a user, I want to log in using my email and password with 2FA support."
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, highest]
 *                 description: New priority for the backlog item
 *                 example: "high"
 *               status:
 *                 type: string
 *                 enum: [new, todo, refining, in-progress, review, done, active]
 *                 description: New status for the backlog item
 *                 example: "in-progress"
 *               epicId:
 *                 type: string
 *                 description: New parent epic ID (for stories)
 *                 example: "epic_002"
 *               storyPoints:
 *                 type: integer
 *                 description: New story points estimate (for stories)
 *                 example: 8
 *               linkedStoryId:
 *                 type: string
 *                 description: New linked story ID (for bugs and tech tasks)
 *                 example: "story_002"
 *               severity:
 *                 type: string
 *                 enum: [minor, major, critical]
 *                 description: New severity level (for bugs)
 *                 example: "critical"
 *               content:
 *                 type: string
 *                 description: New content (for knowledge items)
 *                 example: "Updated decision: Using JWT with refresh tokens."
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: New tags (for knowledge items)
 *                 example: ["auth", "security", "decision"]
 *           examples:
 *             story:
 *               summary: Updating a story
 *               value:
 *                 title: "Updated User Login Story"
 *                 description: "As a user, I want to log in using my email and password with 2FA support."
 *                 priority: "high"
 *                 status: "in-progress"
 *                 storyPoints: 8
 *             bug:
 *               summary: Updating a bug
 *               value:
 *                 title: "Login button unresponsive on Safari and Chrome"
 *                 description: "Updated steps: 1. Open on Safari 15 or Chrome 120. 2. Enter credentials. 3. Click Login."
 *                 priority: "high"
 *                 severity: "critical"
 *                 status: "in-progress"
 *             knowledge:
 *               summary: Updating a knowledge item
 *               value:
 *                 title: "Updated Decision Log: Authentication Flow"
 *                 content: "Updated decision: Using JWT with refresh tokens."
 *                 tags: ["auth", "security", "decision"]
 *     responses:
 *       200:
 *         description: Backlog item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Epic'
 *                 - $ref: '#/components/schemas/Story'
 *                 - $ref: '#/components/schemas/Bug'
 *                 - $ref: '#/components/schemas/TechTask'
 *                 - $ref: '#/components/schemas/Knowledge'
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
 *     description: |
 *       Delete a backlog item from the project.
 *       Note: Deleting an epic will not automatically delete its child stories.
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
 *         example: "proj_abc123"
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the backlog item to delete
 *         example: "story_001"
 *     responses:
 *       200:
 *         description: Backlog item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Backlog item deleted successfully"
 *                 itemId:
 *                   type: string
 *                   description: ID of the deleted item
 *                   example: "story_001"
 *                 projectId:
 *                   type: string
 *                   description: ID of the project
 *                   example: "proj_abc123"
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
