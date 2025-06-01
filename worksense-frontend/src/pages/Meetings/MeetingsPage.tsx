// src/pages/Meetings/MeetingsPage.tsx
import React, { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import styles from "./MeetingsPage.module.css";
import { toast } from "sonner";
import { Calendar, Clock, Users, Video, Plus, Filter } from "lucide-react";
import CreateMeetingModal from "@/components/Meetings/CreateMeetingModal";
import MeetingCard from "@/components/Meetings/MeetingCard";
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
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { setPosition } = useFridaChatPosition();

  React.useEffect(() => {
    if (isCreateModalOpen) {
      setPosition("left");
    } else {
      setPosition("right");
    }
  }, [isCreateModalOpen, setPosition]);

  const { data: meetings = [], isLoading, error, refetch } = useQuery({
    queryKey: ["meetings", projectId, statusFilter],
    queryFn: async () => {
      if (!projectId) return [];
      
      const statusParam = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await apiClient.get(`/projects/${projectId}/meetings${statusParam}`);
      return res.data;
    },
    enabled: !!projectId,
  });

  const handleMeetingCreated = () => {
    toast.success("Meeting created successfully!");
    refetch();
    setIsCreateModalOpen(false);
  };

  const handleMeetingJoin = async (meetingId: string) => {
    try {
      const res = await apiClient.get(`/meetings/${meetingId}/join`);
      const { joinUrl } = res.data;
      
      if (joinUrl) {
        window.open(joinUrl, '_blank');
      } else {
        toast.error("Unable to get meeting link");
      }
    } catch (error) {
      console.error("Error joining meeting:", error);
      toast.error("Failed to join meeting");
    }
  };

  const handleMeetingStatusUpdate = async (meetingId: string, status: string) => {
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
      toast.success("Meeting deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting meeting:", error);
      toast.error("Failed to delete meeting");
    }
  };

  // Helper function to convert Firestore timestamp to Date
  const timestampToDate = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    return new Date(timestamp._seconds * 1000);
  };

  // Group meetings by status
  const groupedMeetings = {
    upcoming: meetings.filter((m: Meeting) => {
      const meetingDate = timestampToDate(m.scheduledDate);
      return m.status === 'scheduled' && meetingDate > new Date();
    }),
    today: meetings.filter((m: Meeting) => {
      const meetingDate = timestampToDate(m.scheduledDate);
      const today = new Date();
      return (
        meetingDate.toDateString() === today.toDateString() &&
        ['scheduled', 'in-progress'].includes(m.status)
      );
    }),
    inProgress: meetings.filter((m: Meeting) => m.status === 'in-progress'),
    completed: meetings.filter((m: Meeting) => m.status === 'completed'),
    cancelled: meetings.filter((m: Meeting) => m.status === 'cancelled')
  };

  const getStatusCount = (status: string) => {
    switch (status) {
      case "scheduled":
        return groupedMeetings.upcoming.length + groupedMeetings.today.length;
      case "in-progress":
        return groupedMeetings.inProgress.length;
      case "completed":
        return groupedMeetings.completed.length;
      case "cancelled":
        return groupedMeetings.cancelled.length;
      default:
        return meetings.length;
    }
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
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <Video className={styles.titleIcon} />
            <div>
              <h1 className={styles.title}>Meetings</h1>
              <p className={styles.subtitle}>Manage and join your project meetings</p>
            </div>
          </div>
          <button
            className={styles.createButton}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={20} />
            Schedule Meeting
          </button>
        </div>
      </div>

      <div className={styles.filtersSection}>
        <div className={styles.filterGroup}>
          <Filter size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Meetings ({meetings.length})</option>
            <option value="scheduled">Scheduled ({getStatusCount("scheduled")})</option>
            <option value="in-progress">In Progress ({getStatusCount("in-progress")})</option>
            <option value="completed">Completed ({getStatusCount("completed")})</option>
            <option value="cancelled">Cancelled ({getStatusCount("cancelled")})</option>
          </select>
        </div>
      </div>

      <div className={styles.content}>
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
                  onDelete={handleMeetingDelete}
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
                  onDelete={handleMeetingDelete}
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
                  onDelete={handleMeetingDelete}
                  timestampToDate={timestampToDate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Meetings */}
        {groupedMeetings.completed.length > 0 && statusFilter === "all" && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Completed</h2>
            <div className={styles.meetingsGrid}>
              {groupedMeetings.completed.slice(0, 6).map((meeting: Meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={handleMeetingJoin}
                  onStatusUpdate={handleMeetingStatusUpdate}
                  onDelete={handleMeetingDelete}
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
            <p>Create your first meeting to get started with team collaboration.</p>
            <button
              className={styles.emptyStateButton}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Schedule Your First Meeting
            </button>
          </div>
        )}
      </div>

      {projectId && (
        <CreateMeetingModal
          projectId={projectId}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onMeetingCreated={handleMeetingCreated}
        />
      )}
    </div>
  );
};

export default MeetingsPage;