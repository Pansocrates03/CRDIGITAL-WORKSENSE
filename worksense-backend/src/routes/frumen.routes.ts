import express from "express";
import { memberAuth } from "../middlewares/projectMiddlewareBundle.js";
import { getFrumen } from "../controllers/frumen.controller.js";
  


const router = express.Router();

router.get("/projects/:projectId/sprints/:sprintId", memberAuth, getFrumen);

export default router;