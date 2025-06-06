// src/pages/Meetings/MeetingsPage.tsx
import React, { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import styles from "./MeetingsPage.module.css";
import { toast } from "sonner";
import { Calendar, Clock, Users, Video, Plus, Trash2 } from "lucide-react";
import CreateMeetingModal from "@/components/Meetings/CreateMeetingModal";
import QuickMeetingModal from "@/components/Meetings/QuickMeetingModal";
import MeetingCard from "@/components/Meetings/MeetingCard";
import DeleteConfirmationModal from "@/components/ui/deleteConfirmationModal/deleteConfirmationModal";
import { useFridaChatPosition } from "@/contexts/FridaChatPositionContext";

interface Meeting {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  scheduledDate: {
    _seconds: number;
    _nanoseconds: number;
  };
  duration: number;
  zoomMeetingId?: string;
  zoomJoinUrl?: string;
  zoomPassword?: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  createdBy: number;
  attendees?: number[];
  transcript?: string;
  summary?: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

const MeetingsPage: FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQuickMeetingModalOpen, setIsQuickMeetingModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<{
    id: string;
    title: string;
    status: string;
  } | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const { setPosition } = useFridaChatPosition();

  React.useEffect(() => {
    if (isCreateModalOpen || isQuickMeetingModalOpen) {
      setPosition("left");
    } else {
      setPosition("right");
    }
  }, [isCreateModalOpen, isQuickMeetingModalOpen, setPosition]);

  const {
    data: meetings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["meetings", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const res = await apiClient.get(`/projects/${projectId}/meetings`);
      return res.data;
    },
    enabled: !!projectId,
  });

  const handleMeetingCreated = () => {
    toast.success("Meeting created successfully!");
    refetch();
    setIsCreateModalOpen(false);
    setIsQuickMeetingModalOpen(false);
  };

  const handleQuickMeeting = async () => {
    try {
      // Create an immediate meeting with default settings
      const now = new Date();
      const meetingData = {
        title: `Quick Meeting - ${now.toLocaleTimeString()}`,
        description: "Quick meeting started immediately",
        scheduledDate: now.toISOString(),
        duration: 40, // Default 40 minutes
        attendees: [], // No pre-selected attendees for quick meetings
      };

      const response = await apiClient.post(
        `/projects/${projectId}/meetings`,
        meetingData
      );
      const meeting = response.data.meeting;

      toast.success("Quick meeting created!");
      refetch();

      // Automatically join the meeting
      if (meeting.zoomJoinUrl) {
        window.open(meeting.zoomJoinUrl, "_blank");
      }
    } catch (error) {
      console.error("Error creating quick meeting:", error);
      toast.error("Failed to create quick meeting");
    }
  };

  const handleMeetingJoin = async (meetingId: string) => {
    try {
      const res = await apiClient.get(`/meetings/${meetingId}/join`);
      const { joinUrl } = res.data;

      if (joinUrl) {
        window.open(joinUrl, "_blank");
      } else {
        toast.error("Unable to get meeting link");
      }
    } catch (error) {
      console.error("Error joining meeting:", error);
      toast.error("Failed to join meeting");
    }
  };

  const handleMeetingStatusUpdate = async (
    meetingId: string,
    status: string
  ) => {
    try {
      await apiClient.patch(`/meetings/${meetingId}/status`, { status });
      toast.success("Meeting status updated");
      refetch();
    } catch (error) {
      console.error("Error updating meeting status:", error);
      toast.error("Failed to update meeting status");
    }
  };

  const handleMeetingDelete = async (meetingId: string) => {
    try {
      await apiClient.delete(`/meetings/${meetingId}`);
      toast.success("Meeting cancelled successfully");
      refetch();
      setShowDeleteModal(false);
      setMeetingToDelete(null);
    } catch (error) {
      console.error("Error cancelling meeting:", error);
      toast.error("Failed to cancel meeting");
    }
  };

  const handleDeleteAllMeetings = async () => {
    try {
      // Delete all meetings for this project
      const deletePromises = meetings.map((meeting: Meeting) =>
        apiClient.delete(`/meetings/${meeting.id}`)
      );

      await Promise.all(deletePromises);
      toast.success(`Deleted ${meetings.length} meetings successfully`);
      refetch();
      setShowDeleteAllModal(false);
    } catch (error) {
      console.error("Error deleting all meetings:", error);
      toast.error("Failed to delete all meetings");
    }
  };

  const handleMeetingDeleteRequest = (
    meetingId: string,
    title: string,
    status: string
  ) => {
    setMeetingToDelete({ id: meetingId, title, status });
    setShowDeleteModal(true);
  };

  const handleMeetingEdit = async (meetingId: string) => {
    // TODO: Implement edit modal
    // For now, just show a toast message
    toast.info("Edit meeting feature coming soon!");
    console.log("Edit meeting:", meetingId);
  };

  // Helper function to convert Firestore timestamp to Date
  const timestampToDate = (timestamp: {
    _seconds: number;
    _nanoseconds: number;
  }) => {
    return new Date(timestamp._seconds * 1000);
  };

  // Group meetings by status
  const groupedMeetings = {
    upcoming: meetings.filter((m: Meeting) => {
      const meetingDate = timestampToDate(m.scheduledDate);
      return m.status === "scheduled" && meetingDate > new Date();
    }),
    today: meetings.filter((m: Meeting) => {
      const meetingDate = timestampToDate(m.scheduledDate);
      const today = new Date();
      return (
        meetingDate.toDateString() === today.toDateString() &&
        ["scheduled", "in-progress"].includes(m.status)
      );
    }),
    inProgress: meetings.filter((m: Meeting) => m.status === "in-progress"),
    completed: meetings.filter((m: Meeting) => m.status === "completed"),
    cancelled: meetings.filter((m: Meeting) => m.status === "cancelled"),
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading meetings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Failed to load meetings. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-4 pt-3">
      <div className="flex items-baseline justify-between w-full">
        <div>
          <h2 className="text-3xl mb-4 tracking-tight text-foreground">
            Meetings
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage and join your project meetings: schedule new meetings or
            start quick sessions.
          </p>
        </div>
        <div className={styles.buttonGroup}>
          {meetings.length > 0 && (
            <button
              className={styles.deleteAllButton}
              onClick={() => setShowDeleteAllModal(true)}
            >
              <Trash2 size={20} />
              Delete All
            </button>
          )}
          <button
            className={styles.quickMeetingButton}
            onClick={handleQuickMeeting}
          >
            <Plus size={20} />
            Start Now
          </button>
          <button
            className={styles.createButton}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={20} />
            Schedule Meeting
          </button>
        </div>
      </div>

      <div className="border-b-2 border-b-gray-200 my-4"></div>

      <div className="space-y-8">
        {/* Today's Meetings */}
        {groupedMeetings.today.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Calendar size={20} />
              Today's Meetings
            </h2>
            <div className={styles.meetingsGrid}>
              {groupedMeetings.today.map((meeting: Meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={handleMeetingJoin}
                  onStatusUpdate={handleMeetingStatusUpdate}
                  onDelete={(meetingId) =>
                    handleMeetingDeleteRequest(
                      meetingId,
                      meeting.title,
                      meeting.status
                    )
                  }
                  onEdit={handleMeetingEdit}
                  timestampToDate={timestampToDate}
                />
              ))}
            </div>
          </div>
        )}

        {/* In Progress Meetings */}
        {groupedMeetings.inProgress.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Clock size={20} />
              In Progress
            </h2>
            <div className={styles.meetingsGrid}>
              {groupedMeetings.inProgress.map((meeting: Meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={handleMeetingJoin}
                  onStatusUpdate={handleMeetingStatusUpdate}
                  onDelete={(meetingId) =>
                    handleMeetingDeleteRequest(
                      meetingId,
                      meeting.title,
                      meeting.status
                    )
                  }
                  onEdit={handleMeetingEdit}
                  timestampToDate={timestampToDate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Meetings */}
        {groupedMeetings.upcoming.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Users size={20} />
              Upcoming Meetings
            </h2>
            <div className={styles.meetingsGrid}>
              {groupedMeetings.upcoming.map((meeting: Meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={handleMeetingJoin}
                  onStatusUpdate={handleMeetingStatusUpdate}
                  onDelete={(meetingId) =>
                    handleMeetingDeleteRequest(
                      meetingId,
                      meeting.title,
                      meeting.status
                    )
                  }
                  onEdit={handleMeetingEdit}
                  timestampToDate={timestampToDate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Meetings */}
        {groupedMeetings.completed.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Completed</h2>
            <div className={styles.meetingsGrid}>
              {groupedMeetings.completed.slice(0, 6).map((meeting: Meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={handleMeetingJoin}
                  onStatusUpdate={handleMeetingStatusUpdate}
                  onDelete={(meetingId) =>
                    handleMeetingDeleteRequest(
                      meetingId,
                      meeting.title,
                      meeting.status
                    )
                  }
                  onEdit={handleMeetingEdit}
                  timestampToDate={timestampToDate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Cancelled Meetings */}
        {groupedMeetings.cancelled.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Cancelled Meetings</h2>
            <div className={styles.meetingsGrid}>
              {groupedMeetings.cancelled.slice(0, 4).map((meeting: Meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={handleMeetingJoin}
                  onStatusUpdate={handleMeetingStatusUpdate}
                  onDelete={(meetingId) =>
                    handleMeetingDeleteRequest(
                      meetingId,
                      meeting.title,
                      meeting.status
                    )
                  }
                  onEdit={handleMeetingEdit}
                  timestampToDate={timestampToDate}
                />
              ))}
            </div>
          </div>
        )}

        {/* No meetings state */}
        {meetings.length === 0 && (
          <div className={styles.emptyState}>
            <Video size={64} className={styles.emptyIcon} />
            <h3>No meetings scheduled</h3>
            <p>
              Create your first meeting to get started with team collaboration.
            </p>
            <div className={styles.emptyStateButtons}>
              <button
                className={styles.emptyStateButton}
                onClick={handleQuickMeeting}
              >
                <Plus size={20} />
                Start Quick Meeting
              </button>
              <button
                className={styles.emptyStateButtonSecondary}
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus size={20} />
                Schedule Meeting
              </button>
            </div>
          </div>
        )}
      </div>

      {projectId && (
        <>
          <CreateMeetingModal
            projectId={projectId}
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onMeetingCreated={handleMeetingCreated}
          />
          <QuickMeetingModal
            projectId={projectId}
            isOpen={isQuickMeetingModalOpen}
            onClose={() => setIsQuickMeetingModalOpen(false)}
            onMeetingCreated={handleMeetingCreated}
          />
        </>
      )}

      {/* Centralized Delete Meeting Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMeetingToDelete(null);
        }}
        onConfirm={() =>
          meetingToDelete && handleMeetingDelete(meetingToDelete.id)
        }
        title={
          meetingToDelete?.status === "scheduled" ||
          meetingToDelete?.status === "in-progress"
            ? "Cancel Meeting"
            : "Delete Meeting"
        }
        message={
          meetingToDelete?.status === "scheduled" ||
          meetingToDelete?.status === "in-progress"
            ? `Are you sure you want to cancel "${meetingToDelete?.title}"? This will delete the meeting and cancel the Zoom session.`
            : `Are you sure you want to permanently delete "${meetingToDelete?.title}"? This action cannot be undone.`
        }
      />

      {/* Delete All Meetings Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={handleDeleteAllMeetings}
        title="Delete All Meetings"
        message={`Are you sure you want to delete all ${meetings.length} meetings? This action cannot be undone and will cancel all associated Zoom sessions.`}
      />
    </div>
  );
};

export default MeetingsPage;
