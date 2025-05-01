import React from "react";
import "./StatusTag.css"; // Use a new CSS file

// Map status text to CSS modifier classes
const statusMap = {
  started: "started",
  "not started": "not-started",
  // Add other statuses if needed
  default: "default",
};

function StatusTag({ text }) {
  // Handle potential null/undefined text
  const statusKey = text ? text.toLowerCase() : "default";
  const statusClass = `status-tag--${
    statusMap[statusKey] || statusMap.default
  }`;

  return <span className={`status-tag ${statusClass}`}>{text}</span>;
}

export default StatusTag;
