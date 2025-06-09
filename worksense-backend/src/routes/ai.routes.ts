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
 *     summary: Generate epic suggestions based on project description
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of suggested epics
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
 *                         description: Epic name
 *                       description:
 *                         type: string
 *                         description: Detailed description of the epic
 *                       priority:
 *                         type: string
 *                         enum: [lowest, low, medium, high, highest]
 *                         description: Epic priority
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: Project not found
 *       502:
 *         description: Error communicating with AI service
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
 *     summary: Confirm and persist suggested epics in the project
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
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
 *                       description: Epic name
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       description: Detailed description of the epic
 *                     priority:
 *                       type: string
 *                       enum: [lowest, low, medium, high, highest]
 *                       description: Epic priority
 *     responses:
 *       201:
 *         description: Epics saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Epics saved"
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: Project not found
 *       409:
 *         description: Conflict - Epics already exist in the project
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
 *     summary: Generate user story suggestions for an epic
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       description: Epic ID for which to generate stories
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
 *         description: List of suggested stories
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
 *                         description: User story title
 *                       description:
 *                         type: string
 *                         nullable: true
 *                         description: Story description
 *                       priority:
 *                         type: string
 *                         enum: [low, medium, high]
 *                         description: Story priority
 *                       assignees:
 *                         type: array
 *                         items:
 *                           type: integer
 *                         description: Assigned user IDs (can be empty)
 *       400:
 *         description: Missing or invalid epicId
 *       401:
 *         description: Unauthorized - Invalid or expired token
 *       404:
 *         description: Project or epic not found
 *       502:
 *         description: Error communicating with AI service
 */
router.post(
  "/stories/generate-stories",
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
 *     summary: Confirm and persist suggested stories in the backlog
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       description: Parent epic and list of stories to save
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
 *                 description: ID of the epic under which to save the stories
 *                 example: "6wqDIVRt1UdvG61OyU08"
 *               stories:
 *                 type: array
 *                 description: User stories to persist
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
  "/stories/confirm-stories",
  memberAuth,
  checkProjectPermission("edit:backlog"),
  confirmStoriesHandler
);

export default router;
