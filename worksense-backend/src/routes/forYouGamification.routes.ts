/**
 * @swagger
 * tags:
 *   name: Gamification
 *   description: Endpoints for managing user gamification data
 */

/**
 * @swagger
 * /projects/{projectId}/gamification/leaderboard/{userId}:
 *   get:
 *     summary: Get personal gamification info for a user
 *     tags: [Gamification]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Personal gamification information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points: 
 *                   type: number
 *                 level:
 *                   type: number
 *                 rank:
 *                   type: string
 *       404:
 *         description: User or project not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /projects/{projectId}/gamification/leaderboard/{userId}:
 *   put:
 *     summary: Update personal gamification info for a user
 *     tags: [Gamification]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               points:
 *                 type: number
 *               level:
 *                 type: number
 *               rank:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated gamification information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 points:
 *                   type: number
 *                 level:
 *                   type: number
 *                 rank:
 *                   type: string
 *       404:
 *         description: User or project not found
 *       500:
 *         description: Server error
 */

import { Router } from "express";
import { getPersonalGamification, updatePersonalGamification } from "../controllers/forYouGamification.controller.js";

const router = Router();

// GET personal gamification info
router.get("/projects/:projectId/gamification/leaderboard/:userId", getPersonalGamification);

// PUT update personal gamification info
router.put("/projects/:projectId/gamification/leaderboard/:userId", updatePersonalGamification);

export default router; 