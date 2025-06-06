// routes/gemini.routes.ts
import { Router } from "express";
import { handleGeminiPrompt } from "../controllers/gemini.controller.js";
import { memoryEnhancementMiddleware } from "../controllers/memory.controller.js";

import { verifyToken} from "../middlewares/bundleMiddleware/tokenAuth.js";

const router = Router();

const authMiddleware = [verifyToken];
router.use(authMiddleware);

router.use(memoryEnhancementMiddleware);

router.post("/ask", handleGeminiPrompt);


export default router;