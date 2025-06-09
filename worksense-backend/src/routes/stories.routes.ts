import { Router } from "express";
import { getStories } from "../controllers/stories.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Stories
 *   description: Endpoints for retrieving user stories in a project
 */

/**
 * @swagger
 * /stories/{userId}/{projectId}:
 *   get:
 *     summary: Get stories for a specific user and project
 *     tags: [Stories]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of stories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *       404:
 *         description: No stories found
 *       500:
 *         description: Server error
 */

// Route to get stories for a specific user and project
router.get("/:userId/:projectId", getStories);
