// routes/cache.routes.ts
import { Router } from "express";
import { getCacheStats, clearCache, refreshProjectCache } from "../controllers/cache.controller.js";
import { verifyToken } from "../middlewares/bundleMiddleware/tokenAuth.js";

const router = Router();

const authMiddleware = [verifyToken];
router.use(authMiddleware);

// Get cache statistics
router.get("/stats", getCacheStats);

// Clear all cache
router.delete("/clear", clearCache);

// Clear cache for specific project
router.delete("/clear/:projectId", clearCache);

// Force refresh cache for specific project
router.post("/refresh/:projectId", refreshProjectCache);

export default router;