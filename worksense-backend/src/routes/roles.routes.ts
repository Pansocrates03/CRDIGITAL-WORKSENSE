import { Router } from "express";
import {
    getProjectRoles,
    createProjectRole,
    updateProjectRole,
    deleteProjectRole,
    getProjectRoleById
} from "../controllers/roles.controllers.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// Get Project Roles
router.get("/projects/:ProjectId/roles", verifyToken, getProjectRoles);

// Create Project Role
router.post("/projects/:ProjectId/roles", verifyToken, createProjectRole);

// Update Project Role
router.put("/projects/:ProjectId/roles/:roleID", verifyToken, updateProjectRole);

// Delete Project Role
router.delete("/projects/:ProjectId/roles/:roleID", verifyToken, deleteProjectRole);

// Get Project Role by ID
router.get("/projects/:ProjectId/roles/:roleID", verifyToken, getProjectRoleById);


export default router;