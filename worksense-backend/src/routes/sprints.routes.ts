import { Router } from "express";
import { createSprint } from "../controllers/sprint.controller.js";
import { verifyToken } from "../middlewares/tokenAuth.js";
import { checkProjectMembership, checkProjectPermission } from "../middlewares/projectAuth.js";

const router = Router();

/**
 * @swagger
 * /projects/{projectId}/sprints:
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
  "/projects/:projectId/sprints",
  verifyToken,
  checkProjectMembership,
  checkProjectPermission("manage:sprints"),
  createSprint
);

export default router; 