import express from "express";
import {createEpic, getEpic, updateEpic, deleteEpic, getEpics} from "../controllers/epics.controller.js"

const router = express.Router({ mergeParams: true });

router.get("/project/:projectId/epics", getEpics);
router.get("/project/:projectId/epic/:epicId", getEpic);
router.put("/project/:projectId/epic/:epicId", updateEpic);
router.post("/project/:projectId/epic/", createEpic);
router.delete("/project/:projectId/epic/:epicId", deleteEpic);

export default router;