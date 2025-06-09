// routes/cache.routes.ts
import { Router } from "express";
import {
  getCacheStats,
  clearCache,
  refreshProjectCache,
} from "../controllers/cache.controller.js";
import { verifyToken } from "../middlewares/bundleMiddleware/tokenAuth.js";

const router = Router();

const authMiddleware = [verifyToken];
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Cache
 *   description: Endpoints for cache management and statistics
 */

/**
 * @swagger
 * /cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Cache statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hits:
 *                   type: number
 *                 misses:
 *                   type: number
 *                 keys:
 *                   type: number
 *       500:
 *         description: Server error
 */

router.get("/stats", getCacheStats);

/**
 * @swagger
 * /cache/clear:
 *   delete:
 *     summary: Clear all cache
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Cache cleared
 *       500:
 *         description: Server error
 */

router.delete("/clear", clearCache);

/**
 * @swagger
 * /cache/clear/{projectId}:
 *   delete:
 *     summary: Clear cache for a specific project
 *     tags: [Cache]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project cache cleared
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */

router.delete("/clear/:projectId", clearCache);

/**
 * @swagger
 * /cache/refresh/{projectId}:
 *   post:
 *     summary: Refresh cache for a specific project
 *     tags: [Cache]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project cache refreshed
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */

router.post("/refresh/:projectId", refreshProjectCache);

export default router;
