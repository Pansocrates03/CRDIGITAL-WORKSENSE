import { Router } from "express";
import { verifyToken } from "../middlewares/bundleMiddleware/tokenAuth.js";
import {
  generateEpicHandler,
  confirmEpicsHandler,
  generateStoriesHandler,
  confirmStoriesHandler,
} from "../controllers/ai.controller.js";
import { memberAuth } from "../middlewares/projectMiddlewareBundle.js";
import { checkProjectPermission } from "../middlewares/bundleMiddleware/projectAuth.js";

const router = Router({ mergeParams: true });

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
  "/generate-epics",
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
  "/confirm-epics",
  memberAuth,
  checkProjectPermission("edit:backlog"),
  confirmEpicsHandler
);

/**
 * @swagger
 * /{projectId}/ai/stories/generate-stories:
 *   post:
 *     tags:
 *       - AI Module
 *     summary: Genera sugerencias de historias de usuario para una épica
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
 *       description: ID de la épica para la cual generar historias
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - epicId
 *             properties:
 *               epicId:
 *                 type: string
 *                 example: "6wqDIVRt1UdvG61OyU08"
 *     responses:
 *       200:
 *         description: Lista de historias sugeridas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Título de la historia de usuario
 *                       description:
 *                         type: string
 *                         nullable: true
 *                         description: Descripción de la historia
 *                       priority:
 *                         type: string
 *                         enum: [low, medium, high]
 *                         description: Prioridad de la historia
 *                       assignees:
 *                         type: array
 *                         items:
 *                           type: integer
 *                         description: IDs de usuarios asignados (puede estar vacío)
 *       400:
 *         description: epicId faltante o inválido
 *       401:
 *         description: No autorizado – token inválido o expirado
 *       404:
 *         description: Proyecto o épica no encontrada
 *       502:
 *         description: Error al comunicarse con el servicio de IA
 */
router.post(
  "/:projectId/ai/stories/generate-stories",
  memberAuth,
  checkProjectPermission("edit:backlog"),
  generateStoriesHandler
);

/**
 * @swagger
 * /{projectId}/ai/stories/confirm-stories:
 *   post:
 *     tags:
 *       - AI Module
 *     summary: Confirma y persiste las historias sugeridas en el backlog
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
 *       description: Épica padre y lista de historias a guardar
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - epicId
 *               - stories
 *             properties:
 *               epicId:
 *                 type: string
 *                 description: ID de la épica bajo la cual se guardan las historias
 *                 example: "6wqDIVRt1UdvG61OyU08"
 *               stories:
 *                 type: array
 *                 description: Historias de usuario a persistir
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - priority
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Título de la historia
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       description: Descripción de la historia
 *                     priority:
 *                       type: string
 *                       enum: [low, medium, high]
 *                       description: Prioridad de la historia
 *     responses:
 *       201:
 *         description: Historias guardadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Stories saved"
 *       400:
 *         description: epicId o stories faltantes / formato inválido
 *       401:
 *         description: No autorizado – token inválido o expirado
 *       404:
 *         description: Proyecto o épica no encontrada
 *       409:
 *         description: Conflicto – Al menos una historia ya existe en el backlog
 */
router.post(
  "/:projectId/ai/stories/confirm-stories",
  memberAuth,
  checkProjectPermission("edit:backlog"),
  confirmStoriesHandler
);

export default router;
