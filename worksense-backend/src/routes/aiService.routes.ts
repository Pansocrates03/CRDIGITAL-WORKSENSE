// import { Router } from "express";
// import { generateEpic } from "../controllers/aiService.controllers.js";
// import { verifyToken } from "../middlewares/auth.js";

// const router = Router();

// /**
//  * @swagger
//  * tags:
//  *   name: AI Module
//  *   description: Operaciones relacionadas con la generación automática mediante IA
//  */

// /**
//  * @swagger
//  * /projects/{id}/generate-epic:
//  *   post:
//  *     summary: Genera una épica y sus historias usando IA a partir de un prompt
//  *     tags: [AI Module]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: ID del proyecto al cual se añadirá la épica generada
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           example:
//  *             prompt: "Crear una épica sobre la funcionalidad de autenticación con usuario y contraseña."
//  *     responses:
//  *       200:
//  *         description: Épica generada exitosamente y añadida al proyecto
//  *         content:
//  *           application/json:
//  *             example:
//  *               message: "Épica creada y guardada"
//  *               epicId: "epic123"
//  */
// router.post('/projects/:id/generate-epic', verifyToken, generateEpic);

// export default router;
