import React from "react";
import "./PriorityTag.css"; // Use a new CSS file

// Map priority level text ("P1", "P2", "P3") to CSS modifier classes
const levelMap = {
  p1: "p1",
  p2: "p2",
  p3: "p3",
  default: "default",
};

function PriorityTag({ text }) {
  // Handle potential null/undefined text
  const levelKey = text ? text.toLowerCase() : "default";
  const levelClass = `priority-tag--${levelMap[levelKey] || levelMap.default}`;

  // Don't render if text is null or undefined
  if (!text) {
    return null;
  }

  return <span className={`priority-tag ${levelClass}`}>{text}</span>;
}

export default PriorityTag;
