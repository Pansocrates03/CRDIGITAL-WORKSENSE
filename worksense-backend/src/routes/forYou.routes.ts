/**
 * @swagger
 * tags:
 *   name: ForYou
 *   description: Endpoints for personalized user dashboard (For You page)
 */

/**
 * @swagger
 * /for-you/assigned-items:
 *   get:
 *     summary: Get all assigned items for a user in a project
 *     tags: [ForYou]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of assigned items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AssignedItem'
 *       400:
 *         description: Missing userId or projectId
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /for-you/completed-tasks:
 *   get:
 *     summary: Get completed tasks for a user in a project
 *     tags: [ForYou]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Max number of completed tasks to return (default 3)
 *     responses:
 *       200:
 *         description: List of completed tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AssignedItem'
 *       400:
 *         description: Missing userId or projectId
 *       500:
 *         description: Server error
 */


import { Router } from 'express';
import { getAssignedItems, getCompletedTasks, getGamification } from '../controllers/forYou.controller.js';

const router = Router();

router.get('/assigned-items', getAssignedItems);
router.get('/completed-tasks', getCompletedTasks);
router.get('/gamification', getGamification);

export default router; 