import { Router } from "express";
import { generateEpic } from "../controllers/aiService.controllers.js"
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

router.post('/projects/:id/generate-epic', verifyToken, generateEpic);

export default router;