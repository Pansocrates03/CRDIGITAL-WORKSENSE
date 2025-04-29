import { Router } from "express";
import { createSprint } from "../controllers/sprint.controller.js";
import { addItemToSprint, getSprintBoard, updateSprintItem, removeSprintItem } from "../controllers/sprintItems.controller.js";
import { verifyToken } from "../middlewares/tokenAuth.js";
import { checkProjectMembership, checkProjectPermission } from "../middlewares/projectAuth.js";

const router = Router();

/**
 * @swagger
 * /projectss/{projectId}/sprints:
 *   post:
 *     summary: Crear un nuevo sprint en un proyecto
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [startDate, endDate]
 *             properties:
 *               name:
 *                 type: string
 *               goal:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Sprint creado correctamente
 *       400:
 *         description: Error de validación o solapamiento
 *       403:
 *         description: Permisos insuficientes
 */
router.post(
  "/projectss/:projectId/sprints",
  verifyToken,
  checkProjectMembership,
  checkProjectPermission("manage:sprints"),
  createSprint
);

/**
 * @swagger
 * /projectss/{projectId}/sprints/{sprintId}/items:
 *   post:
 *     summary: Agregar un item del backlog al sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: sprintId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, originalId, originalType]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [epic, story, bug, techTask, knowledge]
 *               originalId:
 *                 type: string
 *               originalType:
 *                 type: string
 *               sprintAssigneeId:
 *                 type: number
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Item agregado al sprint correctamente
 *       400:
 *         description: Error de validación o item duplicado
 *       404:
 *         description: Sprint o item de backlog no encontrado
 */
router.post(
  "/projectss/:projectId/sprints/:sprintId/items",
  verifyToken,
  checkProjectMembership,
  checkProjectPermission("manage:sprints"),
  addItemToSprint
);

/**
 * @swagger
 * /projectss/{projectId}/sprints/{sprintId}/board:
 *   get:
 *     summary: Obtener el tablero del sprint con todos los items organizados por estado
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: sprintId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tablero del sprint obtenido correctamente
 *       404:
 *         description: Sprint no encontrado
 */
router.get(
  "/projectss/:projectId/sprints/:sprintId/board",
  verifyToken,
  checkProjectMembership,
  getSprintBoard
);

/**
 * @swagger
 * /projectss/{projectId}/sprints/{sprintId}/items/{itemId}:
 *   patch:
 *     summary: Actualizar un item del sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: sprintId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, review, done]
 *               sprintAssigneeId:
 *                 type: number
 *                 nullable: true
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item actualizado correctamente
 *       404:
 *         description: Item no encontrado en el sprint
 */
router.patch(
  "/projectss/:projectId/sprints/:sprintId/items/:itemId",
  verifyToken,
  checkProjectMembership,
  checkProjectPermission("manage:sprints"),
  updateSprintItem
);

/**
 * @swagger
 * /projectss/{projectId}/sprints/{sprintId}/items/{itemId}:
 *   delete:
 *     summary: Eliminar un item del sprint
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: sprintId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item eliminado correctamente
 *       404:
 *         description: Item no encontrado en el sprint
 */
router.delete(
  "/projectss/:projectId/sprints/:sprintId/items/:itemId",
  verifyToken,
  checkProjectMembership,
  checkProjectPermission("manage:sprints"),
  removeSprintItem
);

export default router; 