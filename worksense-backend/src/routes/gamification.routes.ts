import express from 'express';
import {
    getUserGamificationData,
    getProjectLeaderboard,
    getProjectGamificationStats, getProjectActivity
} from '../controllers/gamification.controller.js';
import { verifyToken } from '../middlewares/bundleMiddleware/tokenAuth.js';
import {memberAuth} from "../middlewares/projectMiddlewareBundle.js";

const router = express.Router({ mergeParams: true }); // Important: mergeParams to access :projectId

// Apply authentication middleware to all gamification routes
router.use(verifyToken);

// User gamification data routes
router.get('/user/:userId', getUserGamificationData);        // GET /api/v1/gamification/user/123

// Project-specific gamification routes
router.get('/leaderboard', getProjectLeaderboard);     // GET /api/v1/gamification/projects/abc123/leaderboard
router.get('/stats', getProjectGamificationStats);     // GET /api/v1/gamification/projects/abc123/stats

router.get('/activity',memberAuth, getProjectActivity);

export default router;