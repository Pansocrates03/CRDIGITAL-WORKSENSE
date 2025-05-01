import express from "express";
import * as memberController from "../controllers/member.controller.js";
import {
  memberAuth,
  withPermission,
} from "../middlewares/projectMiddlewareBundle.js";

const router = express.Router({ mergeParams: true });

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
 *       - auth-token: []
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
 *       500:
 *         description: Internal server error
 */

router.get("/", memberAuth, memberController.listMembers);

/**
 * @swagger
 * /{projectId}/members-detail:
 *   get:
 *     summary: List all members of a project with their email addresses
 *     tags: [Project Members]
 *     security:
 *       - auth-token: []
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
 *                     description: Full name of the user (from SQL database)
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     description: Email address of the user (from SQL database)
 *                     example: "john.doe@example.com"
 *                   lastLogin:
 *                     type: integer
 *                     description: Last login timestamp in seconds (from SQL database)
 *                     example: 1745715722
 *                   nickname:
 *                     type: string
 *                     description: User's nickname (from SQL database)
 *                     example: "johndoe"
 *                   profilePicture:
 *                     type: string
 *                     description: URL to user's profile picture (from SQL database)
 *                     example: "https://example.com/profile.jpg"
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error or database connection error
 */

router.get("/members-detail", memberAuth, memberController.listMembersDetail);

/**
 * @swagger
 * /{projectId}/members:
 *   post:
 *     summary: Add a new member to the project
 *     description: |
 *       Add a new member to the project with a specific role.
 *
 *       The user making the request must have the `manage:members` permission for the project.
 *       The `userId` must exist in the SQL database and the `projectRoleId` must exist in the Firestore `/projectRoles` collection.
 *     tags: [Project Members]
 *     security:
 *       - auth-token: []
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
 *         description: Invalid request data or project role not found
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to manage members
 *       404:
 *         description: User not found in SQL database
 *       409:
 *         description: User is already a member of the project
 *       500:
 *         description: Database connection error
 */

router.post("/", withPermission("manage:members"), memberController.addMember);

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
 *       - auth-token: []
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
 *         description: Invalid request data or project role not found
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have permission to manage members
 *       404:
 *         description: Member not found
 *       500:
 *         description: Database connection error
 */

router.put(
  "/:userId",
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
 *       - auth-token: []
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
 *         description: Project or member not found
 *       500:
 *         description: Database connection error
 */

router.delete(
  "/:userId",
  withPermission("manage:members"),
  memberController.removeMember
);

export default router;
