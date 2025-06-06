// src/components/Meetings/MeetingCard.tsx
import React, { FC, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Play,
  MoreVertical,
  Trash2,
  Edit2,
} from "lucide-react";
import styles from "./MeetingCard.module.css";

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

interface MeetingCardProps {
  meeting: Meeting;
  onJoin: (meetingId: string) => void;
  onStatusUpdate: (meetingId: string, status: string) => void;
  onDelete: (meetingId: string) => void;
  onEdit?: (meetingId: string) => void;
  timestampToDate: (timestamp: {
    _seconds: number;
    _nanoseconds: number;
  }) => Date;
}

const MeetingCard: FC<MeetingCardProps> = ({
  meeting,
  onJoin,
  onStatusUpdate,
  onDelete,
  onEdit,
  timestampToDate,
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const [currentStatus, setCurrentStatus] = React.useState(meeting.status);

  const meetingDate = timestampToDate(meeting.scheduledDate);
  const now = new Date();
  const isToday = meetingDate.toDateString() === now.toDateString();
  const timeDiff = meetingDate.getTime() - now.getTime();
  const minutesUntilMeeting = Math.floor(timeDiff / (1000 * 60));
  const meetingEndTime = new Date(
    meetingDate.getTime() + meeting.duration * 60 * 1000
  );
  const isPastEndTime = now > meetingEndTime;
  const canJoin =
    (minutesUntilMeeting <= 15 &&
      minutesUntilMeeting >= -30 &&
      currentStatus !== "cancelled") ||
    currentStatus === "in-progress";

  // Check user role from localStorage - using projectRole like other components
  const getUserRole = (): string | null => {
    try {
      const projectRole = localStorage.getItem("projectRole");
      return projectRole;
    } catch (error) {
      console.error("Error reading project role from localStorage:", error);
      return null;
    }
  };

  const canManageMeetings = (): boolean => {
    const role = getUserRole();
    return role === "product-owner" || role === "scrum-master";
  };

  // Auto-update meeting status based on time
  useEffect(() => {
    if (currentStatus === "scheduled" && isPastEndTime) {
      // Auto-complete meeting if it's past the end time
      setCurrentStatus("completed");
      onStatusUpdate(meeting.id, "completed");
    }
  }, [isPastEndTime, currentStatus, meeting.id, onStatusUpdate]);

  // Update local status when prop changes
  useEffect(() => {
    setCurrentStatus(meeting.status);
  }, [meeting.status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return styles.statusScheduled; // Yellow like backlog
      case "in-progress":
        return styles.statusInProgress; // Blue like progress
      case "completed":
        return styles.statusCompleted; // Green like done
      case "cancelled":
        return styles.statusCancelled; // Red like error
      default:
        return styles.statusScheduled;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Scheduled";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getTimeUntilMeeting = () => {
    if (isPastEndTime && currentStatus === "scheduled") {
      return "Meeting completed";
    } else if (minutesUntilMeeting < -30) {
      return "Meeting ended";
    } else if (minutesUntilMeeting < 0) {
      return "Meeting in progress";
    } else if (minutesUntilMeeting === 0) {
      return "Starting now";
    } else if (minutesUntilMeeting < 60) {
      return `Starts in ${minutesUntilMeeting} min`;
    } else {
      const hours = Math.floor(minutesUntilMeeting / 60);
      return `Starts in ${hours}h ${minutesUntilMeeting % 60}m`;
    }
  };

  const handleJoinClick = () => {
    onJoin(meeting.id);
  };

  const handleStatusChange = (
    newStatus: "scheduled" | "in-progress" | "completed" | "cancelled"
  ) => {
    setCurrentStatus(newStatus);
    onStatusUpdate(meeting.id, newStatus);
    setShowActions(false);
  };

  const handleStartMeeting = () => {
    // Update status to in-progress
    setCurrentStatus("in-progress");
    onStatusUpdate(meeting.id, "in-progress");
    setShowActions(false);

    // Open the meeting immediately if Zoom URL is available
    if (meeting.zoomJoinUrl) {
      window.open(meeting.zoomJoinUrl, "_blank");
    }
  };

  const handleCancelClick = () => {
    onDelete(meeting.id);
    setShowActions(false);
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(meeting.id);
    }
    setShowActions(false);
  };

  return (
    <div className={`${styles.card} ${isToday ? styles.todayCard : ""}`}>
      <div className={styles.cardHeader}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{meeting.title}</h3>
          <span className={`${styles.status} ${getStatusColor(currentStatus)}`}>
            {getStatusText(currentStatus)}
          </span>
        </div>
        <div className={styles.actionsContainer}>
          <button
            className={styles.actionsButton}
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical size={16} />
          </button>
          {showActions && (
            <div className={styles.actionsDropdown}>
              {canManageMeetings() &&
                currentStatus === "scheduled" &&
                !isPastEndTime && (
                  <>
                    <button
                      onClick={handleEditClick}
                      className={styles.actionItem}
                    >
                      <Edit2 size={14} />
                      Edit Meeting
                    </button>
                    <button
                      onClick={handleStartMeeting}
                      className={styles.actionItem}
                    >
                      <Play size={14} />
                      Start Meeting
                    </button>
                    <button
                      onClick={handleCancelClick}
                      className={`${styles.actionItem} ${styles.deleteAction}`}
                    >
                      <Trash2 size={14} />
                      Cancel Meeting
                    </button>
                  </>
                )}
              {canManageMeetings() && currentStatus === "in-progress" && (
                <>
                  <button
                    onClick={() => handleStatusChange("completed")}
                    className={styles.actionItem}
                  >
                    End Meeting
                  </button>
                  <button
                    onClick={handleCancelClick}
                    className={`${styles.actionItem} ${styles.deleteAction}`}
                  >
                    <Trash2 size={14} />
                    Cancel Meeting
                  </button>
                </>
              )}
              {canManageMeetings() &&
                (currentStatus === "completed" ||
                  currentStatus === "cancelled") && (
                  <button
                    onClick={handleCancelClick}
                    className={`${styles.actionItem} ${styles.deleteAction}`}
                  >
                    <Trash2 size={14} />
                    Delete Meeting
                  </button>
                )}
              {/* Show join option for all users if meeting is available */}
              {!canManageMeetings() && canJoin && meeting.zoomJoinUrl && (
                <button onClick={handleJoinClick} className={styles.actionItem}>
                  <Video size={14} />
                  Join Meeting
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {meeting.description && (
        <p className={styles.description}>{meeting.description}</p>
      )}

      <div className={styles.meetingInfo}>
        <div className={styles.infoItem}>
          <Calendar size={16} />
          <span>{formatDate(meetingDate)}</span>
        </div>
        <div className={styles.infoItem}>
          <Clock size={16} />
          <span>{meeting.duration} minutes</span>
        </div>
        {meeting.attendees && meeting.attendees.length > 0 && (
          <div className={styles.infoItem}>
            <Users size={16} />
            <span>{meeting.attendees.length} attendees</span>
          </div>
        )}
      </div>

      {isToday && currentStatus === "scheduled" && !isPastEndTime && (
        <div className={styles.timeInfo}>
          <span className={styles.timeUntil}>{getTimeUntilMeeting()}</span>
        </div>
      )}

      <div className={styles.cardFooter}>
        {canJoin && meeting.zoomJoinUrl && (
          <button className={styles.joinButton} onClick={handleJoinClick}>
            <Video size={16} />
            Join Meeting
          </button>
        )}

        {currentStatus === "completed" && meeting.summary && (
          <button className={styles.summaryButton}>View Summary</button>
        )}

        {currentStatus === "completed" && meeting.transcript && (
          <button className={styles.transcriptButton}>View Transcript</button>
        )}

        {!canJoin && currentStatus === "scheduled" && !isPastEndTime && (
          <div className={styles.waitingInfo}>
            <span>Meeting will be available 15 minutes before start time</span>
          </div>
        )}

        {isPastEndTime && currentStatus === "completed" && (
          <div className={styles.waitingInfo}>
            <span>Meeting completed automatically</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingCard;
