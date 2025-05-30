import express from "express";
import { getProjects, getProject, updateProject, createProject, deleteProject } from "../controllers/projects.controller.js";
import {auth} from "../middlewares/projectMiddlewareBundle.js";

const router = express.Router({ mergeParams: true });

router.use(auth)

router.get("/projects/", getProjects)
router.get("/project/:projectId/", getProject);
router.put("/project/:projectId/", updateProject);
router.post("/project/", createProject);
router.delete("/project/:projectId/", deleteProject)

export default router;