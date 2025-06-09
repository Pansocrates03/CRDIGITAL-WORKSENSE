// routes/speech.routes.ts
import { Router } from "express";
import { getSpeechToken } from "../controllers/speech.controller.js";
import { verifyToken } from "../middlewares/bundleMiddleware/tokenAuth.js";

const router = Router();

const authMiddleware = [verifyToken];
router.use(authMiddleware);

router.get("/token", getSpeechToken);

/**
 * @swagger
 * tags:
 *   name: Speech
 *   description: Endpoints for speech-to-text and voice features
 */

/**
 * @swagger
 * /speech/token:
 *   get:
 *     summary: Get a speech service token
 *     tags: [Speech]
 *     responses:
 *       200:
 *         description: Speech service token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The speech service token
 *                 region:
 *                   type: string
 *                   description: The Azure region for the speech service
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       500:
 *         description: Server error
 */

export default router;
