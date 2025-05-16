import express from "express";
import { handleGeminiPrompt } from "../controllers/gemini.controller.js";
import { verifyToken } from "../middlewares/bundleMiddleware/tokenAuth.js";
import { checkPlatformAdmin } from "../middlewares/bundleMiddleware/adminAuth.js";

const router = express.Router();

const authMiddleware = [verifyToken, checkPlatformAdmin];

router.post("/", authMiddleware, handleGeminiPrompt);

export default router;
