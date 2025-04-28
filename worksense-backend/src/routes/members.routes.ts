import { Router } from "express";
import {
  getProjectMembers,
  getMemberById,
  addMember,
} from "../controllers/members.controllers.js";
const router = Router();

import { verifyToken } from "../middlewares/tokenAuth.js";

/**
 * @swagger
 * /projects/{ProjectId}/members:
 *   get:
 *     summary: Obtener todos los miembros de un proyecto
 *     parameters:
 *       - name: ProjectId
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Miembros obtenidos exitosamente
 *       400:
 *         description: Error al obtener los miembros
 */
router.get("/projects/:ProjectId/members", verifyToken, getProjectMembers); // Obtener todos los miembros de un proyecto

/**
 * @swagger
 * /projects/{ProjectId}/members/{MemberId}:
 *   get:
 *     summary: Obtener un miembro por ID
 *     parameters:
 *       - name: ProjectId
 *         in: path
 *         required: true
 *         type: string
 *       - name: MemberId
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Miembro encontrado exitosamente
 *       400:
 *         description: Error al obtener el miembro
 */
router.get(
  "/projects/:ProjectId/members/:MemberId",
  verifyToken,
  getMemberById
); // Obtener un miembro por ID

/**
 * @swagger
 * /projects/{ProjectId}/members:
 *   post:
 *     summary: Crear un nuevo miembro
 *     parameters:
 *       - name: ProjectId
 *         in: path
 *         required: true
 *         type: string
 *       - name: userId
 *         in: body
 *         required: true
 *         type: string
 *       - name: roleId
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Miembro creado exitosamente
 *       400:
 *         description: Error al crear el miembro
 */
router.post("/projects/:ProjectId/members", verifyToken, addMember); // Crear un nuevo miembro

//router.put("/projects/:id/members/:id", updateMember); // Actualizar un miembro existente
//router.delete("/projects/:id/members/:id", deleteMember); // Eliminar un miembro existente

export default router;
