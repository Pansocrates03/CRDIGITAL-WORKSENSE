import { Router } from "express";
import {
  createItem,
  getAllItems,
  createSubItem,
  getSubItemsByReader,
  getItemById,
  getItemsByProject,
} from "../controllers/items.controller.js";
import { verifyToken } from "../middlewares/tokenAuth.js";

const router = Router();

/**
 * @swagger
 * /items:
 *   post:
 *     summary: Crea un nuevo item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectID, name, description]
 *             properties:
 *               projectID:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               tag:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               size:
 *                 type: number
 *               author:
 *                 type: string
 *               asignee:
 *                 type: array
 *                 items:
 *                   type: string
 *               acceptanceCriteria:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Item creado correctamente
 *       400:
 *         description: Datos faltantes
 */
router.post("/items", verifyToken, createItem);

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Obtiene todos los items de todos los proyectos
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: Lista de items
 */
router.get("/items", getAllItems);

/**
 * @swagger
 * /projects/{projectID}/items:
 *   get:
 *     summary: Obtener todos los items de un proyecto
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Lista de items del proyecto
 */
router.get("/projects/:projectID/items", verifyToken, getItemsByProject);

/**
 * @swagger
 * /items/subitem:
 *   post:
 *     summary: Crea un subitem dentro de un item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectID, parentItemID, name, description]
 *             properties:
 *               projectID:
 *                 type: string
 *               parentItemID:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subitem creado correctamente
 */
router.post("/items/subitem", verifyToken, createSubItem);

/**
 * @swagger
 * /items/subitems:
 *   get:
 *     summary: Obtiene todos los subitems de un item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectID
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: parentItemID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de subitems
 */
router.get("/items/subitems", verifyToken, getSubItemsByReader);

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Obtiene un item por ID (incluye subitems y comentarios)
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: projectID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del item
 *       404:
 *         description: Item no encontrado
 */
router.get("/items/:id", verifyToken, getItemById);

export default router;
