import { Router } from "express";
import { verifyToken } from "../middlewares/auth.js";
import { generateEpicHandler, confirmEpicsHandler } from "../controllers/ai.controller.js";

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

/**
 * POST /api/projects/:id/confirm-epics
 *  - Confirma una épica sugerida
 */
router.post(
    '/projects/:id/confirm-epics',
    verifyToken,
    confirmEpicsHandler
);

export default router;