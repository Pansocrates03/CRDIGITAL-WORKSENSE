import { Router } from "express";
import { verifyToken } from "../middlewares/auth.js";
import { generateEpicHandler } from "../controllers/ai.controller.js";

const router = Router();

/**
 * POST /api/projects/:id/generate-epic
 *  - Genera sugerencias de épicas sin persistir
 */
router.post(
    '/projects/:id/generate-epic',
    verifyToken,
    generateEpicHandler
);

export default router;