import express from "express";
import * as backlogController from "../controllers/backlog.controller.js";
import {
  memberAuth,
  withPermission,
} from "../middlewares/projectMiddlewareBundle.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Backlog Items
 *   description: Backlog item management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BacklogItemBase:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the backlog item
 *         projectId:
 *           type: string
 *           description: ID of the project this item belongs to
 *         type:
 *           type: string
 *           enum: [epic, story, bug, techTask, knowledge]
 *           description: Type of the backlog item
 *         title:
 *           type: string
 *           description: Title of the backlog item
 *         description:
 *           type: string
 *           description: Description of the backlog item
 *         priority:
 *           type: string
 *           enum: [lowest, low, medium, high, highest]
 *           description: Priority of the backlog item
 *         status:
 *           type: string
 *           enum: [new, todo, refining, in-progress, review, done, active]
 *           description: Current status of the backlog item
 *         reporterId:
 *           type: string
 *           description: ID of the user who created the item
 *         assigneeId:
 *           type: string
 *           nullable: true
 *           description: ID of the user assigned to the item
 *         createdAt:
 *           type: object
 *           properties:
 *             _seconds:
 *               type: integer
 *             _nanoseconds:
 *               type: integer
 *           description: Timestamp when the item was created
 *         updatedAt:
 *           type: object
 *           properties:
 *             _seconds:
 *               type: integer
 *             _nanoseconds:
 *               type: integer
 *           description: Timestamp when the item was last updated
 *
 *     Epic:
 *       allOf:
 *         - $ref: '#/components/schemas/BacklogItemBase'
 *         - type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [epic]
 *               description: Type is always 'epic'
 *
 *     Story:
 *       allOf:
 *         - $ref: '#/components/schemas/BacklogItemBase'
 *         - type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [story]
 *               description: Type is always 'story'
 *             epicId:
 *               type: string
 *               nullable: true
 *               description: ID of the parent epic
 *             storyPoints:
 *               type: integer
 *               nullable: true
 *               description: Story points estimate
 *
 *     Bug:
 *       allOf:
 *         - $ref: '#/components/schemas/BacklogItemBase'
 *         - type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [bug]
 *               description: Type is always 'bug'
 *             linkedStoryId:
 *               type: string
 *               nullable: true
 *               description: ID of the linked story
 *             severity:
 *               type: string
 *               enum: [minor, major, critical]
 *               description: Severity level of the bug
 *
 *     TechTask:
 *       allOf:
 *         - $ref: '#/components/schemas/BacklogItemBase'
 *         - type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [techTask]
 *               description: Type is always 'techTask'
 *             linkedStoryId:
 *               type: string
 *               nullable: true
 *               description: ID of the linked story
 *
 *     Knowledge:
 *       allOf:
 *         - $ref: '#/components/schemas/BacklogItemBase'
 *         - type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [knowledge]
 *               description: Type is always 'knowledge'
 *             content:
 *               type: string
 *               description: Content of the knowledge item
 *             tags:
 *               type: array
 *               items:
 *                 type: string
 *               description: Tags associated with the knowledge item
 */

/**
 * @swagger
 * /projects/{projectId}/backlog/items:
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
 *                 enum: [lowest, low, medium, high, highest]
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
  "/items",
  withPermission("edit:backlog"),
  backlogController.createBacklogItem
);

/**
 * @swagger
 * /projects/{projectId}/backlog/items:
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
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: Project not found
 */
router.get("/items", memberAuth, backlogController.listBacklogItems);

/**
 * @swagger
 * /projects/{projectId}/backlog/items/{itemId}:
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
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [epic, story, bug, techTask, knowledge]
 *         description: Type of the backlog item
 *     responses:
 *       200:
 *         description: Backlog item details
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Epic'
 *                 - $ref: '#/components/schemas/Story'
 *                 - $ref: '#/components/schemas/Bug'
 *                 - $ref: '#/components/schemas/TechTask'
 *                 - $ref: '#/components/schemas/Knowledge'
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       404:
 *         description: Project or backlog item not found
 */
router.get("/items/:itemId", memberAuth, backlogController.getBacklogItem);

/**
 * @swagger
 * /projects/{projectId}/backlog/items/{itemId}:
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
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [epic, story, bug, techTask, knowledge]
 *         description: Type of the backlog item
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
 *                 enum: [lowest, low, medium, high, highest]
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
  "/items/:itemId",
  withPermission("edit:backlog"),
  backlogController.updateBacklogItem
);

/**
 * @swagger
 * /projects/{projectId}/backlog/items/{itemId}:
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
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [epic, story, bug, techTask, knowledge]
 *         description: Type of the backlog item
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
  "/items/:itemId",
  withPermission("edit:backlog"),
  backlogController.deleteBacklogItem
);

router.delete(
  "/items/:itemId/subitems/:subItemId",
  withPermission("edit:backlog"),
  backlogController.deleteSubItem
);

router.put(
  "/items/:itemId/subitems/:subItemId",
  withPermission("edit:backlog"),
  backlogController.updateSubItem
);

router.post(
  "/items/:itemId/subitems",
  withPermission("edit:backlog"),
  backlogController.createSubItem
);

export default router;
