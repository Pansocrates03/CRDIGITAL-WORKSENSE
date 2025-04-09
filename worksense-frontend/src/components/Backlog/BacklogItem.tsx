// src/components/BacklogItem.tsx
import React from "react";
import { BacklogItemType, parseTimestamp } from "../../types"; // Import the type and parser

// Define status colors (adjust keys/values to match your actual status strings)
const statusColors: { [key: string]: string } = {
  backlog: "#6b7280", // Gray
  todo: "#facc15", // Yellow
  inprogress: "#3b82f6", // Blue
  done: "#22c55e", // Green
  blocked: "#ef4444", // Red
  // Add other statuses from your system
};

// Define priority styles (adjust keys/values to match your actual priority strings)
const priorityStyles: { [key: string]: string } = {
  highest: "border-l-4 border-red-600",
  high: "border-l-4 border-orange-500",
  medium: "border-l-4 border-yellow-400",
  low: "border-l-4 border-blue-400",
  lowest: "border-l-4 border-gray-400",
};

interface BacklogItemProps {
  item: BacklogItemType;
}

const BacklogItem: React.FC<BacklogItemProps> = ({ item }) => {
  const {
    name,
    description,
    status = "backlog", // Default if missing
    priority = "medium", // Default if missing
    projectID,
    tag,
    size,
    createdAt,
    // asignee, // Could display assignees if needed
  } = item;

  const statusColor =
    statusColors[status.toLowerCase()] || statusColors["backlog"]; // Use lowercase for matching
  const priorityClass =
    priorityStyles[priority.toLowerCase()] || "border-l-4 border-gray-300"; // Use lowercase for matching

  const creationDate = parseTimestamp(createdAt);
  const formattedDate = creationDate
    ? creationDate.toLocaleDateString()
    : "N/A";

  return (
    <div className={`project-card ${priorityClass}`}>
      {/* Header: Title and Status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "1.1rem",
            color: "var(--secondary-color)",
            order: 1,
          }}
        >
          {name}
        </h3>
        <span
          style={{
            backgroundColor: statusColor,
            color: "white",
            padding: "0.2rem 0.6rem",
            borderRadius: "12px",
            fontSize: "0.8rem",
            fontWeight: "500",
            textTransform: "capitalize",
            order: 2, // Ensure status is on the right
          }}
        >
          {status}
        </span>
      </div>

      {/* Project/Tag Info */}
      <div
        style={{
          fontSize: "0.8rem",
          color: "var(--secondary-color)",
          opacity: 0.8,
          marginBottom: "0.5rem",
          display: "flex",
          gap: "1rem",
        }}
      >
        <span>Project: {projectID}</span>
        {tag && <span>Tag: {tag}</span>}
      </div>

      {/* Description */}
      <p
        style={{
          margin: "0.5rem 0",
          color: "var(--text-color)",
          fontSize: "0.9rem",
        }}
      >
        {description || "No description provided."}
      </p>

      {/* Footer: Priority, Size, Date */}
      <div
        style={{
          marginTop: "0.75rem",
          fontSize: "0.8rem",
          color: "var(--secondary-color)",
          opacity: 0.8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <span style={{ textTransform: "capitalize" }}>
          Priority: {priority}
        </span>
        {size !== undefined && <span>Size: {size}</span>}
        <span>Created: {formattedDate}</span>
        {/* You could add assignees here */}
        {/* {item.asignee && item.asignee.length > 0 && <span>Assignees: {item.asignee.join(', ')}</span>} */}
      </div>
    </div>
  );
};

export default BacklogItem;
