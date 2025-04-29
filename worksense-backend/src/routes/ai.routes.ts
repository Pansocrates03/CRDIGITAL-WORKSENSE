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
 *     summary: Genera sugerencias de épicas basadas en la descripción del proyecto
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
 *                         description: Nombre de la épica
 *                       description:
 *                         type: string
 *                         description: Descripción detallada de la épica
 *                       priority:
 *                         type: string
 *                         enum: [lowest, low, medium, high, highest]
 *                         description: Prioridad de la épica
 *       401:
 *         description: No autorizado - Token inválido o expirado
 *       404:
 *         description: Proyecto no encontrado
 *       502:
 *         description: Error al comunicarse con el servicio de IA
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
 *     summary: Confirma y persiste las épicas sugeridas en el proyecto
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
 *                       description: Nombre de la épica
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       description: Descripción detallada de la épica
 *                     priority:
 *                       type: string
 *                       enum: [lowest, low, medium, high, highest]
 *                       description: Prioridad de la épica
 *     responses:
 *       201:
 *         description: Épicas guardadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Epics saved"
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado - Token inválido o expirado
 *       404:
 *         description: Proyecto no encontrado
 *       409:
 *         description: Conflicto - Las épicas ya existen en el proyecto
 */
router.post(
  "/:projectId/ai/confirm-epics",
  memberAuth,
  checkProjectPermission("edit:backlog"),
  confirmEpicsHandler
);

export default router;
