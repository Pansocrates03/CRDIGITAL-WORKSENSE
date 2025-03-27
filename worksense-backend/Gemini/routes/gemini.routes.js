import express from "express";
import { getGeminiResponse } from "../controllers/gemini.controller.js";

const router = express.Router();

console.log("✅ Ruta de Gemini cargada correctamente");

router.get(
  "/gemini",
  (req, res, next) => {
    console.log("📌 Se recibió una solicitud a /api/gemini");
    next();
  },
  getGeminiResponse
);

export default router;
