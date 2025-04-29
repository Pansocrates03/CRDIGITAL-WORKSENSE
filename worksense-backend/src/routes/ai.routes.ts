import { Router } from "express";
import { verifyToken } from "../middlewares/tokenAuth.js";
import {
  generateEpicHandler,
  confirmEpicsHandler,
} from "../controllers/ai.controller.js";
import { memberAuth } from "./project.routes.js";
import { checkProjectPermission } from "../middlewares/projectAuth.js";
const router = Router();

/**
 * POST /api/projects/:id/generate-epic
 *  - Genera sugerencias de épicas sin persistir
 */
router.post(
  "/:projectId/ai/generate-epic",
  memberAuth,
  checkProjectPermission("edit:backlog"),
  generateEpicHandler
);

/**
 * POST /api/projects/:id/confirm-epics
 *  - Confirma una épica sugerida
 */
router.post(
  "/:projectId/ai/confirm-epics",
  memberAuth,
  checkProjectPermission("edit:backlog"),
  confirmEpicsHandler
);

export default router;
