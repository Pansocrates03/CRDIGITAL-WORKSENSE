// controllers/meetings.controller.ts
import { Request, Response } from "express";
import { db } from "../models/firebase.js"; // Import Firestore instance
import { Timestamp } from "firebase-admin/firestore";

// Types for meetings
interface Meeting {
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  scheduledDate: Timestamp;
  duration: number; // in minutes
  zoomMeetingId?: string;
  zoomJoinUrl?: string;
  zoomPassword?: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  createdBy: number;
  attendees?: number[]; // Array of user IDs
  transcript?: string;
  summary?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

import { zoomService } from "../service/zoom.service.js";

interface ZoomMeetingResponse {
  id: string;
  join_url: string;
  password: string;
  topic: string;
  start_time: string;
  duration: number;
}

// Create a new meeting
export const createMeeting = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { title, description, scheduledDate, duration, attendees } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!title || !scheduledDate || !duration) {
      res.status(400).json({
        message: "Missing required fields: title, scheduledDate, duration",
      });
      return;
    }

    // Create Zoom meeting
    const zoomMeeting = await zoomService.createMeeting({
      topic: title,
      start_time: new Date(scheduledDate).toISOString(),
      duration: duration,
      timezone: "UTC",
      agenda: description,
    });

    const now = Timestamp.now();
    const meetingData: Omit<Meeting, "id"> = {
      projectId,
      title,
      description: description || null,
      scheduledDate: Timestamp.fromDate(new Date(scheduledDate)),
      duration,
      zoomMeetingId: zoomMeeting.id,
      zoomJoinUrl: zoomMeeting.join_url,
      zoomPassword: zoomMeeting.password,
      status: "scheduled",
      createdBy: userId,
      attendees: attendees || [],
      createdAt: now,
      updatedAt: now,
    };

    // Add meeting to Firestore
    const meetingRef = await db.collection("meetings").add(meetingData);

    const createdMeeting: Meeting = {
      id: meetingRef.id,
      ...meetingData,
    };

    res.status(201).json({
      message: "Meeting created successfully",
      meeting: createdMeeting,
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all meetings for a project
export const getProjectMeetings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;

    // Use a simpler query to avoid composite index requirements
    let query = db.collection("meetings").where("projectId", "==", projectId);

    const snapshot = await query.get();

    let meetings: Meeting[] = [];
    interface MeetingDocData extends Omit<Meeting, "id"> {}

    snapshot.forEach(
      (
        doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
      ) => {
        const data = doc.data() as MeetingDocData;
        const meeting: Meeting = {
          id: doc.id,
          ...data,
        };

        // Filter by status in code if needed
        if (!status || meeting.status === status) {
          meetings.push(meeting);
        }
      }
    );

    // Sort by scheduledDate in code instead of in the query
    meetings.sort((a, b) => {
      const dateA = a.scheduledDate.toDate();
      const dateB = b.scheduledDate.toDate();
      return dateB.getTime() - dateA.getTime(); // Descending order
    });

    res.json(meetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get a specific meeting
export const getMeeting = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { meetingId } = req.params;

    const meetingDoc = await db.collection("meetings").doc(meetingId).get();

    if (!meetingDoc.exists) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }

    const meeting: Meeting = {
      id: meetingDoc.id,
      ...meetingDoc.data(),
    } as Meeting;

    res.json(meeting);
  } catch (error) {
    console.error("Error fetching meeting:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update meeting status
export const updateMeetingStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { meetingId } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (
      !["scheduled", "in-progress", "completed", "cancelled"].includes(status)
    ) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const meetingRef = db.collection("meetings").doc(meetingId);
    const meetingDoc = await meetingRef.get();

    if (!meetingDoc.exists) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }

    await meetingRef.update({
      status,
      updatedAt: Timestamp.now(),
    });

    res.json({ message: "Meeting status updated successfully" });
  } catch (error) {
    console.error("Error updating meeting status:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update meeting with transcript and summary
export const updateMeetingTranscript = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { meetingId } = req.params;
    const { transcript, summary } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const meetingRef = db.collection("meetings").doc(meetingId);
    const meetingDoc = await meetingRef.get();

    if (!meetingDoc.exists) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }

    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    if (transcript) updateData.transcript = transcript;
    if (summary) updateData.summary = summary;

    await meetingRef.update(updateData);

    res.json({ message: "Meeting transcript/summary updated successfully" });
  } catch (error) {
    console.error("Error updating meeting transcript:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Delete a meeting
export const deleteMeeting = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { meetingId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const meetingRef = db.collection("meetings").doc(meetingId);
    const meetingDoc = await meetingRef.get();

    if (!meetingDoc.exists) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }

    const meetingData = meetingDoc.data() as Meeting;

    // Check if user is the creator or has permission
    if (meetingData.createdBy !== userId) {
      res
        .status(403)
        .json({ message: "You don't have permission to delete this meeting" });
      return;
    }

    // Delete the Zoom meeting if it exists
    if (meetingData.zoomMeetingId) {
      try {
        await zoomService.deleteMeeting(meetingData.zoomMeetingId);
      } catch (zoomError) {
        console.warn("Failed to delete Zoom meeting:", zoomError);
        // Continue with deletion even if Zoom deletion fails
      }
    }

    await meetingRef.delete();

    res.json({ message: "Meeting deleted successfully" });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Join meeting (redirect to Zoom)
export const joinMeeting = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { meetingId } = req.params;

    const meetingDoc = await db.collection("meetings").doc(meetingId).get();

    if (!meetingDoc.exists) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }

    const meeting = meetingDoc.data() as Meeting;

    if (!meeting.zoomJoinUrl) {
      res
        .status(400)
        .json({ message: "No Zoom link available for this meeting" });
      return;
    }

    // Update meeting status if it's scheduled and within 15 minutes of start time
    const now = new Date();
    const meetingTime = meeting.scheduledDate.toDate();
    const timeDiff = meetingTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    if (
      meeting.status === "scheduled" &&
      minutesDiff <= 15 &&
      minutesDiff >= -30
    ) {
      await db.collection("meetings").doc(meetingId).update({
        status: "in-progress",
        updatedAt: Timestamp.now(),
      });
    }

    res.json({
      joinUrl: meeting.zoomJoinUrl,
      password: meeting.zoomPassword,
      meetingId: meeting.zoomMeetingId,
    });
  } catch (error) {
    console.error("Error joining meeting:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
