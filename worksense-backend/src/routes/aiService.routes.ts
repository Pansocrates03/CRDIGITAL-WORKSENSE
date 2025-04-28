import { Router } from "express";
import { generateEpic } from "../controllers/aiService.controllers.js";
import { verifyToken } from "../middlewares/tokenAuth.js";

const router = Router();

/**
 * @swagger
 * /projects/{id}/generate-epic:
 *   post:
 *     summary: Generate an epic (plus stories) from an AI prompt
 *     tags: [AI Module]
 *     security:
 *       - authToken: []
 */
router.post("/projects/:id/generate-epic", verifyToken, generateEpic);

export default router;
