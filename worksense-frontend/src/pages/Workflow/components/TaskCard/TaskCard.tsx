import React from "react";
import StatusTag from "../StatusTag/StatusTag";
import PriorityTag from "../PriorityTag/PriorityTag";
import { formatTaskDate } from "../../utils/formatDate";
// Use the new CSS file name if you changed it
import "./TaskCard.css"; // Or the original if you overwrote it

// --- Icons ---
import {
  FiCheckCircle,
  FiMessageSquare,
  FiPaperclip,
  FiCheckSquare,
} from "react-icons/fi";

const CheckmarkIcon = ({ color }) => (
  <FiCheckCircle style={{ color: color || "#9ca3af", marginRight: "6px" }} />
);
const CommentIcon = () => <FiMessageSquare />;
const LinkIcon = () => <FiPaperclip />;
const SubtaskIcon = () => <FiCheckSquare />;

// --- TaskCard Component ---
function TaskCard({ task }) {
  if (!task) return null;

  // Handle placeholder card
  if (task.isPlaceholder) {
    // ... (keep placeholder logic as before)
    return (
      <div className="task-card task-card--placeholder">
        {task.coverImageUrl && (
          <img
            src={task.coverImageUrl}
            alt="Placeholder graphic"
            className="task-card__cover-image task-card__cover-image--placeholder"
          />
        )}
      </div>
    );
  }

  const {
    title = "",
    // headerColors is no longer used for the progress bar itself
    status = "",
    priority = null,
    assignees = [],
    startDate = null,
    endDate = null,
    commentsCount = 0,
    linksCount = 0,
    subtasksCompleted = 0, // Need this
    subtasksTotal = 0, // Need this
    coverImageUrl = null,
  } = task;

  // --- Calculate Progress ---
  const hasSubtasks = subtasksTotal > 0;
  const progressPercent = hasSubtasks
    ? Math.min(100, Math.max(0, (subtasksCompleted / subtasksTotal) * 100)) // Ensure 0-100 range
    : 0;

  // --- Determine Checkmark Color (Optional: could be static now) ---
  // Let's make it static green for simplicity, or keep the old logic if needed elsewhere
  const checkmarkColor = "#34D399"; // Example: Teal/Green

  const displayAssignee = assignees?.[0];
  const formattedDate = formatTaskDate(startDate, endDate);
  const showMeta = commentsCount > 0 || linksCount > 0 || subtasksTotal > 0; // Keep subtasksTotal here for the icon display

  return (
    <div className="task-card">
      {/* --- Progress Bar --- */}
      {hasSubtasks && ( // Only show the bar if there are subtasks
        <div className="task-card__progress-bar-container">
          <div
            className="task-card__progress-bar"
            style={{ width: `${progressPercent}%` }} // Dynamic width
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Subtask progress"
          ></div>
        </div>
      )}
      {/* --- Cover Image (If Exists and NO progress bar OR if you want both) --- */}
      {/* Decide if cover image replaces progress bar or sits below it */}
      {/* Option 1: Cover image only if NO progress bar */}
      {/* {!hasSubtasks && coverImageUrl && ( ... )} */}
      {/* Option 2: Cover image always shown if available (below progress bar) */}
      {coverImageUrl && (
        <img
          src={coverImageUrl}
          alt={`Cover for ${title}`}
          className="task-card__cover-image"
        />
      )}
      {/* --- Main Content Area --- */}
      <div className="task-card__content">
        {/* --- Title --- */}
        {title && (
          <div className="task-card__title-area">
            <CheckmarkIcon color={checkmarkColor} />
            <h4 className="task-card__title">{title}</h4>
          </div>
        )}

        {/* --- Tags (Status & Priority) --- */}
        {(status || priority) && (
          <div className="task-card__tags-area">
            {status && <StatusTag text={status} />}
            {priority && <PriorityTag text={priority} />}
          </div>
        )}

        {/* --- Details Row (Assignee, Date, Meta Icons) --- */}
        {(displayAssignee || formattedDate || showMeta) && (
          <div className="task-card__details-row">
            {/* Assignee & Date */}
            <div className="task-card__assignee-date">
              {/* ... assignee image ... */}
              {displayAssignee && (
                <img
                  src={
                    displayAssignee.avatarUrl || "/avatars/default-avatar.png"
                  }
                  alt={displayAssignee.name || "Assignee"}
                  title={displayAssignee.name || displayAssignee.id}
                  className="task-card__assignee-avatar"
                />
              )}
              {formattedDate && (
                <span className="task-card__date">{formattedDate}</span>
              )}
            </div>

            {/* Meta Icons */}
            {showMeta && (
              <div className="task-card__meta-icons">
                {/* ... comment, link, subtask icons ... */}
                {commentsCount > 0 && (
                  <span>
                    <CommentIcon /> {commentsCount}
                  </span>
                )}
                {linksCount > 0 && (
                  <span>
                    <LinkIcon /> {linksCount}
                  </span>
                )}
                {subtasksTotal > 0 && ( // Keep icon logic based on subtasksTotal
                  <span>
                    <SubtaskIcon /> {subtasksCompleted}/{subtasksTotal}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>{" "}
      {/* End content area */}
    </div> // End task card
  );
}

export default TaskCard;
