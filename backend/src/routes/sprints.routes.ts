import express from "express";
import { getSprint, updateSprint, createSprint, deleteSprint, getSprints } from "../controllers/sprints.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/project/:projectId/sprints", getSprints);
router.get("/project/:projectId/sprint/:sprintId", getSprint);
router.put("/project/:projectId/sprint/:sprintId", updateSprint);
router.post("/project/:projectId/sprint", createSprint);
router.delete("/project/:projectId/sprint/:sprintId", deleteSprint)

export default router;