// src/components/sprints/tasks/taskcard/TaskCard.tsx

import React from "react";
import { Task } from "@/types/Task"; // Adjust path if needed
import StatusTag from "../../status/StatusTag"; // Adjust path
import PriorityTag from "../../priority/PriorityTag"; // Adjust path
import { formatTaskDate } from "../../../../lib/formatDate"; // Adjust path
import "./TaskCard.css"; // Ensure this CSS file exists

// --- Icons ---
import {
  FiCheckCircle,
  FiMessageSquare,
  FiPaperclip,
  FiCheckSquare,
} from "react-icons/fi";

// --- Import Draggable from react-beautiful-dnd ---
import { Draggable } from "react-beautiful-dnd";

// --- Helper Icon Components (keep as before) ---
const CheckmarkIcon = ({ color }: { color?: string }) => (
  <FiCheckCircle style={{ color: color || "#9ca3af", marginRight: "6px" }} />
);
const CommentIcon = () => <FiMessageSquare size={14} />; // Slightly smaller?
const LinkIcon = () => <FiPaperclip size={14} />;
const SubtaskIcon = () => <FiCheckSquare size={14} />;
// --- End Helper Icons ---

// --- Define Props for TaskCard ---
interface TaskCardProps {
  task: Task; // The task object containing all data
  index: number; // The index of this card within its column (REQUIRED by Draggable)
  onClick?: (taskId: string) => void; // Optional click handler (e.g., for opening modal)
}

// --- TaskCard Component ---
function TaskCard({ task, index, onClick }: TaskCardProps) {
  // Early return if no task data is provided
  if (!task) return null;

  // Destructure properties from the task object with defaults
  // Use your actual Task type properties here
  const {
    id, // Needed for draggableId
    title = "Untitled Task",
    status = "", // Can be useful for styling/logic even if column implies it
    priority = null,
    assignees = [], // Assuming assignees is an array (e.g., [{ id, name, avatarUrl }, ...])
    startDate = null,
    endDate = null,
    commentsCount = 0,
    linksCount = 0,
    subtasksCompleted = 0,
    subtasksTotal = 0,
    coverImageUrl = null,
    // Add any other relevant fields from your Task type: e.g., tags, estimate...
  } = task;

  // --- Calculations ---
  const hasSubtasks = subtasksTotal > 0;
  const progressPercent = hasSubtasks
    ? Math.min(100, Math.max(0, (subtasksCompleted / subtasksTotal) * 100))
    : 0;

  // Determine Checkmark Color (simple green for now)
  const checkmarkColor = "#34D399";

  // Get the first assignee for display (or handle multiple assignees later)
  const displayAssignee = assignees?.[0]; // Assuming structure { id, name, avatarUrl }
  const formattedDate = formatTaskDate(startDate, endDate);
  // Determine if the meta icons row should be shown
  const showMeta = commentsCount > 0 || linksCount > 0 || hasSubtasks;

  // --- Card Click Handler ---
  const handleCardClick = () => {
    if (onClick) {
      onClick(id); // Pass the task ID to the handler
    } else {
      console.log("Task card clicked (no handler provided):", id);
    }
  };

  // --- Render Draggable Card ---
  return (
    // Wrap the entire card structure with the Draggable component
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          // Apply the ref and props required by react-beautiful-dnd
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps} // Makes the whole card draggable
          // Apply dynamic class based on dragging state for visual feedback
          className={`task-card ${
            snapshot.isDragging ? "task-card--dragging" : ""
          }`}
          // Apply necessary inline styles injected by react-beautiful-dnd during drag
          style={{
            ...provided.draggableProps.style, // Crucial for positioning during drag
          }}
          // Add the click handler to the main div
          onClick={handleCardClick}
        >
          {/* --- Progress Bar --- */}
          {hasSubtasks && (
            <div className="task-card__progress-bar-container">
              <div
                className="task-card__progress-bar"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Subtask progress"
              ></div>
            </div>
          )}
          {/* --- Cover Image --- */}
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
            <div className="task-card__title-area">
              {/* Removed CheckmarkIcon unless it has specific meaning */}
              {/* <CheckmarkIcon color={checkmarkColor} /> */}
              <h4 className="task-card__title">{title}</h4>
            </div>

            {/* --- Tags (Priority) --- */}
            {/* Status tag might be redundant if column implies status */}
            {priority && (
              <div className="task-card__tags-area">
                {/* {status && <StatusTag text={status} />} */}
                {priority && <PriorityTag priority={priority} />}
                {/* Add other tags here if needed (e.g., based on task.tags) */}
              </div>
            )}

            {/* --- Details Row (Assignee, Date, Meta Icons) --- */}
            {(displayAssignee || formattedDate || showMeta) && (
              <div className="task-card__details-row">
                {/* Assignee Avatar & Date */}
                <div className="task-card__assignee-date">
                  {displayAssignee && (
                    <img
                      src={
                        displayAssignee.avatarUrl ||
                        "/avatars/default-avatar.png"
                      } // Provide a fallback avatar
                      alt={displayAssignee.name || "Assignee"}
                      title={displayAssignee.name || displayAssignee.id} // Tooltip for name
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
                    {commentsCount > 0 && (
                      <span title={`${commentsCount} comments`}>
                        {" "}
                        {/* Tooltip */}
                        <CommentIcon /> {commentsCount}
                      </span>
                    )}
                    {linksCount > 0 && (
                      <span title={`${linksCount} attachments`}>
                        {" "}
                        {/* Tooltip */}
                        <LinkIcon /> {linksCount}
                      </span>
                    )}
                    {hasSubtasks && ( // Show subtask icon and progress if subtasks exist
                      <span
                        title={`${subtasksCompleted} of ${subtasksTotal} subtasks complete`}
                      >
                        {" "}
                        {/* Tooltip */}
                        <SubtaskIcon /> {subtasksCompleted}/{subtasksTotal}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* You could add more fields here: estimate, story points, etc. */}
          </div>{" "}
          {/* End content area */}
        </div> // End draggable div
      )}
    </Draggable> // End Draggable component
  );
}

export default TaskCard;
