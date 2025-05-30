import { Router } from "express";
import {
  generateEpicHandler,
  confirmEpicsHandler,
  generateStoriesHandler,
  confirmStoriesHandler,
} from "../controllers/ai.controller.js";

const router = Router({ mergeParams: true });

router.get("/project/:projectId/generate-epics", generateEpicHandler);

router.post("/project/:projectId/confirm-epics", confirmEpicsHandler);

router.post("/project/:projectId/stories/generate-stories", generateStoriesHandler );

router.post("/project/:projectId/stories/confirm-stories", confirmStoriesHandler );

export default router;