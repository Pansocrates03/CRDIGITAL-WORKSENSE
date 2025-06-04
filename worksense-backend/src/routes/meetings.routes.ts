// routes/meetings.routes.ts
import { Router } from "express";
import {
  createMeeting,
  getProjectMeetings,
  getMeeting,
  updateMeetingStatus,
  updateMeetingTranscript,
  deleteMeeting,
  joinMeeting,
} from "../controllers/meetings.controller.js";
import { verifyToken } from "../middlewares/bundleMiddleware/tokenAuth.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Project-specific meeting routes (mounted under /projects)
router.post("/:projectId/meetings", createMeeting); // Create a new meeting
router.get("/:projectId/meetings", getProjectMeetings); // Get all meetings for a project
router.get("/:projectId/meetings/:meetingId", getMeeting); // Get specific meeting

// Global meeting routes (will be mounted separately under /meetings)
export const globalMeetingRoutes = Router();
globalMeetingRoutes.use(verifyToken);
globalMeetingRoutes.patch("/:meetingId/status", updateMeetingStatus); // Update meeting status
globalMeetingRoutes.patch("/:meetingId/transcript", updateMeetingTranscript); // Update transcript/summary
globalMeetingRoutes.delete("/:meetingId", deleteMeeting); // Delete meeting
globalMeetingRoutes.get("/:meetingId/join", joinMeeting); // Join meeting (get Zoom link)

export default router;
