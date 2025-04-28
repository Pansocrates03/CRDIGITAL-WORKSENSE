// routes/adminRoutes.ts
import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import { verifyToken } from "../middlewares/tokenAuth.js";
import { checkPlatformAdmin } from "../middlewares/adminAuth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Platform Admin
 *   description: Platform-level administration operations
 */

// Apply auth middlewares to all routes
const authMiddleware = [verifyToken, checkPlatformAdmin];

/**
 * @swagger
 * /admin/permissions:
 *   get:
 *     summary: List all available permissions in the platform
 *     tags: [Platform Admin]
 *     security:
 *       - authToken: []
 *     responses:
 *       200:
 *         description: List of available permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a platform admin
 */
router.get(
  "/permissions",
  authMiddleware,
  adminController.listAvailablePermissions
);

/**
 * @swagger
 * /admin/projectRoles:
 *   get:
 *     summary: List all project roles
 *     tags: [Platform Admin]
 *     security:
 *       - authToken: []
 *     responses:
 *       200:
 *         description: List of project roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   permissions:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a platform admin
 */
router.get("/projectRoles", authMiddleware, adminController.listProjectRoles);

/**
 * @swagger
 * /admin/projectRoles:
 *   post:
 *     summary: Create a new project role
 *     tags: [Platform Admin]
 *     security:
 *       - authToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the role
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of permission identifiers
 *     responses:
 *       201:
 *         description: Project role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a platform admin
 */
router.post("/projectRoles", authMiddleware, adminController.createProjectRole);

/**
 * @swagger
 * /admin/projectRoles/{roleId}:
 *   put:
 *     summary: Update an existing project role
 *     tags: [Platform Admin]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the role to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the role
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated list of permission identifiers
 *     responses:
 *       200:
 *         description: Project role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a platform admin
 *       404:
 *         description: Role not found
 */
router.put(
  "/projectRoles/:roleId",
  authMiddleware,
  adminController.updateProjectRole
);

/**
 * @swagger
 * /admin/projectRoles/{roleId}:
 *   delete:
 *     summary: Delete a project role
 *     tags: [Platform Admin]
 *     security:
 *       - authToken: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the role to delete
 *     responses:
 *       200:
 *         description: Project role deleted successfully
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User is not a platform admin
 *       404:
 *         description: Role not found
 */
router.delete(
  "/projectRoles/:roleId",
  authMiddleware,
  adminController.deleteProjectRole
);

export default router;
