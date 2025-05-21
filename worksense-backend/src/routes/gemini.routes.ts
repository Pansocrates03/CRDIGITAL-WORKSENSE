// routes/gemini.routes.ts
import { Router } from "express";
import { handleGeminiPrompt } from "../controllers/gemini.controller.js";
import { memoryEnhancementMiddleware } from "../controllers/memory.controller.js";

import { verifyToken} from "../middlewares/bundleMiddleware/tokenAuth.js";

const router = Router();

const authMiddleware = [verifyToken];
router.use(authMiddleware);

// Usar el middleware de memoria
router.use(memoryEnhancementMiddleware);

// Ruta para interactuar con el asistente - SIN autenticación para pruebas
router.post("/ask", handleGeminiPrompt);


export default router;