// routes/gemini.routes.ts
import { Router } from "express";
import { handleGeminiPrompt } from "../controllers/gemini.controller.js";
import { memoryEnhancementMiddleware } from "../controllers/memory.controller.js";

import { verifyToken } from "../middlewares/bundleMiddleware/tokenAuth.js";

const router = Router();

const authMiddleware = [verifyToken];
router.use(authMiddleware);

router.use(memoryEnhancementMiddleware);

/**
 * @swagger
 * tags:
 *   name: Gemini
 *   description: Endpoints for Gemini AI-powered features
 */

/**
 * @swagger
 * /gemini/ask:
 *   post:
 *     summary: Send a prompt to Gemini AI and receive a response
 *     tags: [Gemini]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt/question to send to Gemini AI
 *                 example: "Summarize the last sprint's achievements."
 *     responses:
 *       200:
 *         description: Gemini AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: The AI-generated response
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */

router.post("/ask", handleGeminiPrompt);

export default router;
