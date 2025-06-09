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
  // Recurring meeting fields
  isRecurring?: boolean;
  recurringGroupId?: string; // Groups all meetings from the same recurring pattern
  recurrencePattern?: {
    frequency: "weekly";
    daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
    endDate?: Timestamp;
  };
}

interface RecurringMeetingTemplate {
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  duration: number;
  attendees?: number[];
  recurrencePattern: {
    frequency: "weekly";
    daysOfWeek: number[];
    startDate: Timestamp;
    endDate?: Timestamp;
  };
  createdBy: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
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

// Helper function to generate dates for recurring meetings
const generateRecurringDates = (
  startDate: Date,
  daysOfWeek: number[],
  endDate?: Date
): Date[] => {
  const dates: Date[] = [];
  const current = new Date(startDate);
  const end =
    endDate || new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // Default 3 months

  // Always include the initial scheduled date, regardless of recurrence pattern
  const initialMeeting = new Date(startDate);
  dates.push(initialMeeting);

  // Start from the beginning of the week containing startDate
  const startOfWeek = new Date(current);
  startOfWeek.setDate(current.getDate() - current.getDay());

  while (startOfWeek <= end) {
    for (const dayOfWeek of daysOfWeek) {
      const meetingDate = new Date(startOfWeek);
      meetingDate.setDate(startOfWeek.getDate() + dayOfWeek);
      meetingDate.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);

      // Create date-only comparison (no time) for end date check
      const meetingDateOnly = new Date(
        meetingDate.getFullYear(),
        meetingDate.getMonth(),
        meetingDate.getDate()
      );
      const endDateOnly = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
      );

      // Only include dates that are after the start date and on or before end date
      // Also check that we don't duplicate the initial meeting
      if (
        meetingDate >= startDate &&
        meetingDateOnly <= endDateOnly &&
        meetingDate.getTime() !== startDate.getTime()
      ) {
        dates.push(new Date(meetingDate));
      }
    }

    // Move to next week
    startOfWeek.setDate(startOfWeek.getDate() + 7);
  }

  return dates.sort((a, b) => a.getTime() - b.getTime());
};

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

// Create recurring meetings
export const createRecurringMeetings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      scheduledDate,
      duration,
      attendees,
      recurrencePattern,
    } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!title || !scheduledDate || !duration || !recurrencePattern) {
      res.status(400).json({
        message: "Missing required fields for recurring meeting",
      });
      return;
    }

    if (
      !recurrencePattern.daysOfWeek ||
      recurrencePattern.daysOfWeek.length === 0
    ) {
      res.status(400).json({
        message: "At least one day of the week must be selected",
      });
      return;
    }

    const startDate = new Date(scheduledDate);
    const endDate = recurrencePattern.endDate
      ? new Date(recurrencePattern.endDate)
      : undefined;

    // Generate all dates for the recurring meetings
    const recurringDates = generateRecurringDates(
      startDate,
      recurrencePattern.daysOfWeek,
      endDate
    );

    if (recurringDates.length === 0) {
      res.status(400).json({
        message: "No valid dates found for the recurring pattern",
      });
      return;
    }

    // Limit the number of meetings to prevent API rate limiting and resource issues
    const maxMeetings = 50;
    if (recurringDates.length > maxMeetings) {
      res.status(400).json({
        message: `Too many meetings would be created (${recurringDates.length}). Maximum allowed is ${maxMeetings}. Please reduce the date range or number of days selected.`,
      });
      return;
    }

    // Create a unique group ID for this recurring series
    const recurringGroupId = `recurring_${Date.now()}_${userId}`;
    const now = Timestamp.now();

    // First, create the recurring template for future reference
    const templateData: Omit<RecurringMeetingTemplate, "id"> = {
      projectId,
      title,
      description: description || null,
      duration,
      attendees: attendees || [],
      recurrencePattern: {
        frequency: "weekly",
        daysOfWeek: recurrencePattern.daysOfWeek,
        startDate: Timestamp.fromDate(startDate),
        endDate: endDate ? Timestamp.fromDate(endDate) : undefined,
      },
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };

    const templateRef = await db
      .collection("recurringMeetingTemplates")
      .add(templateData);

    // Create individual meetings for each date
    const createdMeetings: Meeting[] = [];
    const batchSize = 3; // Reduced batch size to prevent rate limiting
    const delayBetweenRequests = 2000; // 2 seconds between individual requests
    const delayBetweenBatches = 5000; // 5 seconds between batches

    console.log(
      `Creating ${recurringDates.length} recurring meetings with rate limiting...`
    );

    for (let i = 0; i < recurringDates.length; i += batchSize) {
      const batch = recurringDates.slice(i, i + batchSize);
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          recurringDates.length / batchSize
        )}`
      );

      for (let j = 0; j < batch.length; j++) {
        const date = batch[j];
        try {
          // Add delay between individual requests within a batch
          if (j > 0) {
            await new Promise((resolve) =>
              setTimeout(resolve, delayBetweenRequests)
            );
          }

          console.log(`Creating meeting for ${date.toLocaleDateString()}...`);

          // Create Zoom meeting for each occurrence
          const zoomMeeting = await zoomService.createMeeting({
            topic: `${title} - ${date.toLocaleDateString()}`,
            start_time: date.toISOString(),
            duration: duration,
            timezone: "UTC",
            agenda: description,
          });

          const meetingData: Omit<Meeting, "id"> = {
            projectId,
            title: `${title} - ${date.toLocaleDateString()}`,
            description: description || null,
            scheduledDate: Timestamp.fromDate(date),
            duration,
            zoomMeetingId: zoomMeeting.id,
            zoomJoinUrl: zoomMeeting.join_url,
            zoomPassword: zoomMeeting.password,
            status: "scheduled",
            createdBy: userId,
            attendees: attendees || [],
            isRecurring: true,
            recurringGroupId,
            recurrencePattern: {
              frequency: "weekly",
              daysOfWeek: recurrencePattern.daysOfWeek,
              endDate: endDate ? Timestamp.fromDate(endDate) : undefined,
            },
            createdAt: now,
            updatedAt: now,
          };

          const meetingRef = await db.collection("meetings").add(meetingData);
          createdMeetings.push({
            id: meetingRef.id,
            ...meetingData,
          });

          console.log(
            `✅ Meeting created successfully for ${date.toLocaleDateString()}`
          );
        } catch (error) {
          console.error(
            `❌ Error creating meeting for ${date.toLocaleDateString()}:`,
            error
          );

          // If it's a rate limit error, wait longer and continue
          if (error instanceof Error && error.message.includes("rate limit")) {
            console.log(
              "Rate limit hit, waiting 10 seconds before continuing..."
            );
            await new Promise((resolve) => setTimeout(resolve, 10000));
          } else {
            // For other errors, continue but log them
            console.error(
              "Non-rate-limit error, continuing with next meeting..."
            );
          }
        }
      }

      // Add delay between batches
      if (i + batchSize < recurringDates.length) {
        console.log(
          `Waiting ${delayBetweenBatches / 1000} seconds before next batch...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, delayBetweenBatches)
        );
      }
    }

    res.status(201).json({
      message: `Created ${createdMeetings.length} recurring meetings successfully`,
      recurringGroupId,
      templateId: templateRef.id,
      meetings: createdMeetings,
      totalMeetings: createdMeetings.length,
    });
  } catch (error) {
    console.error("Error creating recurring meetings:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Cancel all future meetings in a recurring series
export const cancelRecurringSeries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { recurringGroupId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Get all future meetings in this recurring series
    const now = new Date();
    const meetingsQuery = await db
      .collection("meetings")
      .where("recurringGroupId", "==", recurringGroupId)
      .where("status", "==", "scheduled")
      .get();

    const futureMeetings = meetingsQuery.docs.filter((doc) => {
      const meeting = doc.data() as Meeting;
      const meetingDate = meeting.scheduledDate.toDate();
      return meetingDate > now;
    });

    // Cancel future meetings
    const cancelPromises = futureMeetings.map(async (doc) => {
      const meeting = doc.data() as Meeting;

      // Cancel Zoom meeting if it exists
      if (meeting.zoomMeetingId) {
        try {
          await zoomService.deleteMeeting(meeting.zoomMeetingId);
        } catch (zoomError) {
          console.warn(
            `Failed to delete Zoom meeting ${meeting.zoomMeetingId}:`,
            zoomError
          );
        }
      }

      // Update meeting status to cancelled
      await db.collection("meetings").doc(doc.id).update({
        status: "cancelled",
        updatedAt: Timestamp.now(),
      });
    });

    await Promise.all(cancelPromises);

    // Mark the template as inactive
    const templateQuery = await db
      .collection("recurringMeetingTemplates")
      .where("projectId", "==", req.params.projectId)
      .where("createdBy", "==", userId)
      .get();

    const templateUpdatePromises = templateQuery.docs.map((doc) =>
      doc.ref.update({
        isActive: false,
        updatedAt: Timestamp.now(),
      })
    );

    await Promise.all(templateUpdatePromises);

    res.json({
      message: `Cancelled ${futureMeetings.length} future meetings in the recurring series`,
      cancelledCount: futureMeetings.length,
    });
  } catch (error) {
    console.error("Error cancelling recurring series:", error);
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

    // Auto-update completed meetings based on time
    const now = new Date();
    const updatePromises: Promise<void>[] = [];

    meetings.forEach((meeting) => {
      if (meeting.status === "scheduled") {
        const meetingEndTime = new Date(
          meeting.scheduledDate.toDate().getTime() +
            meeting.duration * 60 * 1000
        );
        if (now > meetingEndTime) {
          // Auto-complete past meetings
          meeting.status = "completed";
          updatePromises.push(
            db
              .collection("meetings")
              .doc(meeting.id!)
              .update({
                status: "completed",
                updatedAt: Timestamp.now(),
              })
              .then(() => void 0)
          );
        }
      }
    });

    // Execute auto-updates
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    // Sort by scheduledDate in code instead of in the query
    meetings.sort((a, b) => {
      const dateA = a.scheduledDate.toDate();
      const dateB = b.scheduledDate.toDate();
      return dateA.getTime() - dateB.getTime(); // Ascending order - closest meetings first
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
