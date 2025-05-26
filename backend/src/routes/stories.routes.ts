import express from "express";
import { getStories, getStory, updateStory, createStory, deleteStory } from "../controllers/stories.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/project/:projectId/stories", getStories);
router.get("/project/:projectId/story/:storyId", getStory);
router.put("/project/:projectId/story/:storyId", updateStory);
router.post("/project/:projectId/story", createStory);
router.delete("/project/:projectId/story/:storyId", deleteStory)

export default router;