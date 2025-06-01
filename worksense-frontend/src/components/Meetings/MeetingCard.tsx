// src/components/Meetings/MeetingCard.tsx
import React, { FC } from "react";
import { Calendar, Clock, Users, Video, Play, MoreVertical, Trash2 } from "lucide-react";
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

interface MeetingCardProps {
  meeting: Meeting;
  onJoin: (meetingId: string) => void;
  onStatusUpdate: (meetingId: string, status: string) => void;
  onDelete: (meetingId: string) => void;
  timestampToDate: (timestamp: { _seconds: number; _nanoseconds: number }) => Date;
}

const MeetingCard: FC<MeetingCardProps> = ({
  meeting,
  onJoin,
  onStatusUpdate,
  onDelete,
  timestampToDate
}) => {
  const [showActions, setShowActions] = React.useState(false);
  const meetingDate = timestampToDate(meeting.scheduledDate);
  const now = new Date();
  const isToday = meetingDate.toDateString() === now.toDateString();
  const isPast = meetingDate < now;
  const timeDiff = meetingDate.getTime() - now.getTime();
  const minutesUntilMeeting = Math.floor(timeDiff / (1000 * 60));
  const canJoin = minutesUntilMeeting <= 15 && minutesUntilMeeting >= -30 && meeting.status !== 'cancelled';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return styles.statusScheduled;
      case 'in-progress':
        return styles.statusInProgress;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusScheduled;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getTimeUntilMeeting = () => {
    if (minutesUntilMeeting < -30) {
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

  const handleStatusChange = (newStatus: string) => {
    onStatusUpdate(meeting.id, newStatus);
    setShowActions(false);
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      onDelete(meeting.id);
    }
    setShowActions(false);
  };

  return (
    <div className={`${styles.card} ${isToday ? styles.todayCard : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{meeting.title}</h3>
          <span className={`${styles.status} ${getStatusColor(meeting.status)}`}>
            {getStatusText(meeting.status)}
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
              {meeting.status === 'scheduled' && (
                <>
                  <button
                    onClick={() => handleStatusChange('in-progress')}
                    className={styles.actionItem}
                  >
                    Start Meeting
                  </button>
                  <button
                    onClick={() => handleStatusChange('cancelled')}
                    className={styles.actionItem}
                  >
                    Cancel Meeting
                  </button>
                </>
              )}
              {meeting.status === 'in-progress' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className={styles.actionItem}
                >
                  End Meeting
                </button>
              )}
              <button
                onClick={handleDeleteClick}
                className={`${styles.actionItem} ${styles.deleteAction}`}
              >
                <Trash2 size={14} />
                Delete
              </button>
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

      {(isToday || meeting.status === 'in-progress') && (
        <div className={styles.timeInfo}>
          <span className={styles.timeUntil}>{getTimeUntilMeeting()}</span>
        </div>
      )}

      <div className={styles.cardFooter}>
        {canJoin && meeting.zoomJoinUrl && (
          <button
            className={styles.joinButton}
            onClick={handleJoinClick}
          >
            <Video size={16} />
            Join Meeting
          </button>
        )}
        
        {meeting.status === 'completed' && meeting.summary && (
          <button className={styles.summaryButton}>
            View Summary
          </button>
        )}
        
        {meeting.status === 'completed' && meeting.transcript && (
          <button className={styles.transcriptButton}>
            View Transcript
          </button>
        )}

        {!canJoin && meeting.status === 'scheduled' && !isPast && (
          <div className={styles.waitingInfo}>
            <span>Meeting will be available 15 minutes before start time</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingCard;