import express from "express";
import { getBugs, getBug, updateBug, createBug, deleteBug } from "../controllers/bugs.controller.js"

const router = express.Router({ mergeParams: true });

router.get("project/:projectId/bugs", getBugs);
router.get("project/:projectId/bug", getBug);
router.put("project/:projectId/bug", updateBug);
router.post("project/:projectId/bug", createBug);
router.delete("project/:projectId/bug", deleteBug)

export default router;