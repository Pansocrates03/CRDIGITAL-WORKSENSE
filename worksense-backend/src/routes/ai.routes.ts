// src/routes/ai.routes.ts
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
 * /projects/{projectId}/ai/generate-epic:
 *   post:
 *     tags:
 *       - AI Module
 *     summary: Genera sugerencias de épicas sin persistir
 *     description: |
 *       Llama al servicio de IA para generar de 3 a 5 épicas sugeridas
 *       basadas en el nombre y la descripción del proyecto.
 *     security:
 *       - authToken: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         description: Identificador del proyecto
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Lista de épicas sugeridas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 epics:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Epic'
 *       '400':
 *         description: Parámetros invalidos o respuesta de IA malformada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Token de autenticación faltante o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '502':
 *         description: Error al comunicarse con la IA
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/:projectId/ai/generate-epic",
  memberAuth,
  checkProjectPermission("edit:backlog"),
  generateEpicHandler
);

/**
 * @swagger
 * /projects/{projectId}/ai/confirm-epics:
 *   post:
 *     tags:
 *       - AI Module
 *     summary: Persiste las épicas confirmadas en Firestore
 *     description: |
 *       Recibe un array de épicas generadas por IA y las guarda
 *       (con sus historias y tareas) usando un batch de Firestore.
 *     security:
 *       - authToken: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         description: Identificador del proyecto
 *         required: true
 *         schema:
 *           type: string
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
 *                   $ref: '#/components/schemas/Epic'
 *     responses:
 *       '201':
 *         description: Épicas guardadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Epics saved
 *       '400':
 *         description: Body inválido (no array o fuera de rango)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Proyecto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '409':
 *         description: Ninguna épica nueva para guardar (todas duplicadas)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/:projectId/ai/confirm-epics",
  memberAuth,
  checkProjectPermission("edit:backlog"),
  confirmEpicsHandler
);

export default router;
