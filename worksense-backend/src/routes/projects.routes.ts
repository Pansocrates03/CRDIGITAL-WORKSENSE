import { Router } from "express";
import { getProjects, getProjectById, createProject } from "../controllers/projects.controllers.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

router.get("/projects", verifyToken   , getProjects);

// router.get("/projects/:id", verifyToken, getProjectById);

router.post("/projects", verifyToken, createProject);

export default router;
