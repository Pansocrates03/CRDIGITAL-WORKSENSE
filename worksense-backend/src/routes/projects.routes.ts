import { Router } from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  getProjectsByUser
} from "../controllers/projects.controllers.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Project Management
 *   description: Operaciones relacionadas con la gestión de proyectos
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Obtiene todos los proyectos
 *     tags: [Project Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *         content:
 *           application/json:
 *             example:
 *               - id: "proj1"
 *                 name: "Test Project Alpha"
 *                 description: "A temporary hardcoded project for development purposes."
 *                 bugs: []
 *                 epics: []
 */
router.get("/projects", verifyToken, getProjects);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Obtiene un proyecto por ID
 *     tags: [Project Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Información del proyecto
 *         content:
 *           application/json:
 *             example:
 *               id: "proj1"
 *               name: "Test Project Alpha"
 *               description: "..."
 *               bugs: []
 *               epics: []
 */
router.get("/projects/:id", verifyToken, getProjectById);

/**
 * @swagger
 * /projectsbyuser:
 *   get:
 *     summary: Obtiene proyectos creados por el usuario autenticado
 *     tags: [Project Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos del usuario
 *         content:
 *           application/json:
 *             example:
 *               - id: "proj1"
 *                 name: "Test Project Alpha"
 *                 createdBy: "user@example.com"
 */
router.get("/projectsbyuser", verifyToken, getProjectsByUser);

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Crea un nuevo proyecto
 *     tags: [Project Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Nuevo Proyecto"
 *             description: "Este es un proyecto de prueba"
 *     responses:
 *       200:
 *         description: Proyecto creado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id: "generatedProjectId"
 *               message: "Proyecto creado exitosamente"
 */
router.post("/projects", verifyToken, createProject);

export default router;
