import express from "express";
import {getRoles, getRole, updateRole, createRole, deleteRole} from "../controllers/roles.controllers.js"

const router = express.Router({ mergeParams: true });

router.get("/project/:projectId/roles", getRoles);
router.get("/project/:projectId/role/:roleId", getRole);
router.put("/project/:projectId/role/:roleId", updateRole);
router.post("/project/:projectId/role/", createRole);
router.delete("/project/:projectId/role/:roleId", deleteRole);

export default router;