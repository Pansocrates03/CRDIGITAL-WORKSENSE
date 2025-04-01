import { Router } from "express";
import { getProjects, getProjectById, createProject } from "../controllers/projects.controller.js";

const router = Router();

router.get("/projects", getProjects);         // Obtener todos los proyectos
router.get("/projects/:id", getProjectById); // Obtener un proyecto por ID
router.post("/projects", createProject);      // Crear un nuevo proyecto

export default router;
