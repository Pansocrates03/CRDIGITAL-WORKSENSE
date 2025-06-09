// routes/meetings.routes.ts
import { Router } from "express";
import {
  createMeeting,
  createRecurringMeetings,
  cancelRecurringSeries,
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

/**
 * @swagger
 * tags:
 *   name: Meetings
 *   description: Endpoints for meeting management and scheduling
 */

/**
 * @swagger
 * /projects/{projectId}/meetings:
 *   post:
 *     summary: Create a new meeting for a project
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Meeting created
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all meetings for a project
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of meetings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                   endTime:
 *                     type: string
 *                     format: date-time
 *                   participants:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /projects/{projectId}/meetings/recurring:
 *   post:
 *     summary: Create recurring meetings for a project
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recurrenceRule:
 *                 type: string
 *               title:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Recurring meetings created
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /projects/{projectId}/meetings/recurring/{recurringGroupId}/cancel:
 *   patch:
 *     summary: Cancel a recurring meeting series
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *       - in: path
 *         name: recurringGroupId
 *         schema:
 *           type: string
 *         required: true
 *         description: Recurring group ID
 *     responses:
 *       200:
 *         description: Recurring series cancelled
 *       404:
 *         description: Series not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /projects/{projectId}/meetings/{meetingId}:
 *   get:
 *     summary: Get a specific meeting by ID
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         schema:
 *           type: string
 *         required: true
 *         description: Project ID
 *       - in: path
 *         name: meetingId
 *         schema:
 *           type: string
 *         required: true
 *         description: Meeting ID
 *     responses:
 *       200:
 *         description: Meeting details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *                 endTime:
 *                   type: string
 *                   format: date-time
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Meeting not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /meetings/{meetingId}/status:
 *   patch:
 *     summary: Update the status of a meeting
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         schema:
 *           type: string
 *         required: true
 *         description: Meeting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: New status (e.g., scheduled, completed, cancelled)
 *     responses:
 *       200:
 *         description: Meeting status updated
 *       404:
 *         description: Meeting not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /meetings/{meetingId}/transcript:
 *   patch:
 *     summary: Update the transcript/summary of a meeting
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         schema:
 *           type: string
 *         required: true
 *         description: Meeting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transcript:
 *                 type: string
 *                 description: The updated transcript or summary
 *     responses:
 *       200:
 *         description: Meeting transcript updated
 *       404:
 *         description: Meeting not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /meetings/{meetingId}:
 *   delete:
 *     summary: Delete a meeting
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         schema:
 *           type: string
 *         required: true
 *         description: Meeting ID
 *     responses:
 *       200:
 *         description: Meeting deleted
 *       404:
 *         description: Meeting not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /meetings/{meetingId}/join:
 *   get:
 *     summary: Join a meeting (get Zoom link)
 *     tags: [Meetings]
 *     parameters:
 *       - in: path
 *         name: meetingId
 *         schema:
 *           type: string
 *         required: true
 *         description: Meeting ID
 *     responses:
 *       200:
 *         description: Zoom join link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 joinUrl:
 *                   type: string
 *                   description: The Zoom join URL
 *       404:
 *         description: Meeting not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// Project-specific meeting routes (mounted under /projects)
router.post("/:projectId/meetings", createMeeting); // Create a new meeting
router.post("/:projectId/meetings/recurring", createRecurringMeetings); // Create recurring meetings
router.patch(
  "/:projectId/meetings/recurring/:recurringGroupId/cancel",
  cancelRecurringSeries
); // Cancel recurring series
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
