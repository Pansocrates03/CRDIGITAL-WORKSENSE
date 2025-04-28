import { Router } from "express";
import { generateEpic } from "../controllers/aiService.controllers.js";
import { verifyToken } from "../middlewares/tokenAuth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AI Module
 *   description: Operations related to AI-powered content generation
 */

/**
 * @swagger
 * /projects/{id}/generate-epic:
 *   post:
 *     summary: Generate an epic and its stories using AI from a prompt
 *     tags: [AI Module]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project to which the generated epic will be added
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Description of the epic to generate
 *                 example: "Create an epic about user authentication with username and password"
 *     responses:
 *       200:
 *         description: Epic generated successfully and added to the project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Epic created and saved"
 *                 epicId:
 *                   type: string
 *                   example: "epic123"
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       404:
 *         description: Project not found
 *       500:
 *         description: AI service error
 */
router.post("/projects/:id/generate-epic", verifyToken, generateEpic);

export default router;
