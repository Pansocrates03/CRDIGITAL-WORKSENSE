// routes/cache.routes.ts
import { Router } from "express";
import { getCacheStats, clearCache, refreshProjectCache } from "../controllers/cache.controller.js";
import { verifyToken } from "../middlewares/bundleMiddleware/tokenAuth.js";

const router = Router();

const authMiddleware = [verifyToken];
router.use(authMiddleware);

router.get("/stats", getCacheStats);

router.delete("/clear", clearCache);

router.delete("/clear/:projectId", clearCache);

router.post("/refresh/:projectId", refreshProjectCache);

export default router;