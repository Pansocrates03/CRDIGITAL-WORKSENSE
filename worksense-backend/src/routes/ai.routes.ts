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
 * @swagger
 * /{projectId}/ai/generate-epic:
 *   post:
 *     tags:
 *       - AI Module
 *     summary: Genera sugerencias de épicas sin persistir
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Lista de épicas sugeridas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 epics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       priority:
 *                         type: string
 *                         enum:
 *                           - lowest
 *                           - low
 *                           - medium
 *                           - high
 *                           - highest
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 *       502:
 *         $ref: '#/components/schemas/Error'
 */
router.post(
  "/:projectId/ai/generate-epic",
  memberAuth,
  checkProjectPermission("edit:backlog"),
  generateEpicHandler
);

/**
 * @swagger
 * /{projectId}/ai/confirm-epics:
 *   post:
 *     tags:
 *       - AI Module
 *     summary: Confirma y persiste épicas sugeridas
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - epics
 *             properties:
 *               epics:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - priority
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     priority:
 *                       type: string
 *                       enum:
 *                         - lowest
 *                         - low
 *                         - medium
 *                         - high
 *                         - highest
 *     responses:
 *       201:
 *         description: Épicas guardadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       409:
 *         $ref: '#/components/schemas/Error'
 */
router.post(
  "/:projectId/ai/confirm-epics",
  memberAuth,
  checkProjectPermission("edit:backlog"),
  confirmEpicsHandler
);

export default router;
