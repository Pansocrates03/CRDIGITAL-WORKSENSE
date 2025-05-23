// routes/speech.routes.ts
import { Router } from "express";
import { getSpeechToken } from "../controllers/speech.controller.js";
import { verifyToken } from "../middlewares/bundleMiddleware/tokenAuth.js";

const router = Router();

const authMiddleware = [verifyToken];
router.use(authMiddleware);

router.get("/token", getSpeechToken);

export default router;
