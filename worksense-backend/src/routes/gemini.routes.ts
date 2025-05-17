// routes/gemini.routes.ts
import { Router } from "express";
import { handleGeminiPrompt } from "../controllers/gemini.controller.js";
import { memoryEnhancementMiddleware } from "../controllers/memory.controller.js";

const router = Router();

// Comentar cualquier middleware de autenticación para pruebas iniciales
// const authMiddleware = [verifyToken, checkPlatformAdmin];
// router.use(authMiddleware);

// Usar el middleware de memoria
router.use(memoryEnhancementMiddleware);

// Ruta para interactuar con el asistente - SIN autenticación para pruebas
router.post("/ask", handleGeminiPrompt);

// Ruta para verificar el status del asistente
router.get("/status", (req, res) => {
  res.json({ 
    status: "online", 
    version: "1.0.0",
    memory: "enabled",
    timestamp: new Date().toISOString()
  });
});

export default router;


