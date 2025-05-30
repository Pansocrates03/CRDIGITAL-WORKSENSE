// routes/gemini.routes.ts
import { Router } from "express";
import { handleGeminiPrompt } from "../controllers/gemini.controller.js";
import { memoryEnhancementMiddleware } from "../controllers/memory.controller.js";
import { verifyToken} from "../middlewares/bundleMiddleware/tokenAuth.js";

console.log("🤖 Loading Gemini routes..."); // Debug line

const router = Router();

const authMiddleware = [verifyToken];
router.use(authMiddleware);

// Usar el middleware de memoria
router.use(memoryEnhancementMiddleware);

// Ruta para interactuar con el asistente
router.post("/ask", handleGeminiPrompt);

console.log("🤖 Gemini routes registered: POST /ask"); // Debug line

export default router;