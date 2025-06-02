import { Router } from "express";
import { getPersonalGamification, updatePersonalGamification } from "../controllers/forYouGamification.controller.js";

const router = Router();

// GET personal gamification info
router.get("/projects/:projectId/gamification/leaderboard/:userId", getPersonalGamification);

// PUT update personal gamification info
router.put("/projects/:projectId/gamification/leaderboard/:userId", updatePersonalGamification);

export default router; 