import express from "express";
import {
  getUserGamificationData,
  getProjectLeaderboard,
  getProjectGamificationStats,
  getProjectActivity,
} from "../controllers/gamification.controller.js";
import { verifyToken } from "../middlewares/bundleMiddleware/tokenAuth.js";
import { memberAuth } from "../middlewares/projectMiddlewareBundle.js";

const router = express.Router({ mergeParams: true }); // Important: mergeParams to access :projectId

// Apply authentication middleware to all gamification routes
router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Gamification
 *   description: Endpoints for project and user gamification data
 */

/**
 * @swagger
 * /gamification/user/{userId}:
 *   get:
 *     summary: Get gamification data for a user
 *     tags: [Gamification]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User gamification data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points:
 *                   type: number
 *                 level:
 *                   type: number
 *                 achievements:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

// User gamification data routes
router.get("/user/:userId", getUserGamificationData); // GET /api/v1/gamification/user/123

/**
 * @swagger
 * /gamification/leaderboard:
 *   get:
 *     summary: Get project leaderboard
 *     tags: [Gamification]
 *     responses:
 *       200:
 *         description: Project leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   points:
 *                     type: number
 *                   rank:
 *                     type: number
 *       500:
 *         description: Server error
 */

// Project-specific gamification routes
router.get("/leaderboard", getProjectLeaderboard); // GET /api/v1/gamification/projects/abc123/leaderboard

/**
 * @swagger
 * /gamification/stats:
 *   get:
 *     summary: Get project gamification statistics
 *     tags: [Gamification]
 *     responses:
 *       200:
 *         description: Project gamification statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalPoints:
 *                   type: number
 *                 totalAchievements:
 *                   type: number
 *       500:
 *         description: Server error
 */

router.get("/stats", getProjectGamificationStats); // GET /api/v1/gamification/projects/abc123/stats

/**
 * @swagger
 * /gamification/activity:
 *   get:
 *     summary: Get project gamification activity
 *     tags: [Gamification]
 *     responses:
 *       200:
 *         description: Project activity feed
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   activity:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       403:
 *         description: Forbidden - User is not a member of the project
 *       500:
 *         description: Server error
 */

router.get("/activity", memberAuth, getProjectActivity);

export default router;
