import express from "express";
import { callGemini } from "../controllers/gemini.controller.js";

const router = express.Router();

router.post("/", callGemini);

export default router;
