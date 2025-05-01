// src/components/BacklogTable/StatusBadge.tsx
import React, { FC } from "react";
import styles from "./StatusBadge.module.css";

interface StatusBadgeProps {
  type: "status" | "severity" | "priority";
  value: string;
}

const StatusBadge: FC<StatusBadgeProps> = ({ type, value }) => {
  // Format the value for CSS class compatibility
  const normalizedValue = value
    .replace(/\s+/g, "") // Remove spaces
    .replace(/-/g, ""); // Remove dashes

  // Create the class name based on type and normalized value
  const getClassName = (): string => {
    const baseClass = styles.badge;

    // Handle capitalization variations by converting to lowercase first
    const typeClass = `${type}${
      normalizedValue.charAt(0).toUpperCase() +
      normalizedValue.slice(1).toLowerCase()
    }`;

    // Check if the class exists in our styles
    if (styles[typeClass]) {
      return `${baseClass} ${styles[typeClass]}`;
    }

    // Special case handling for "to do" / "todo"
    if (
      type === "status" &&
      (normalizedValue.toLowerCase() === "todo" ||
        normalizedValue.toLowerCase() === "todo")
    ) {
      return `${baseClass} ${styles.statusTodo}`;
    }

    // Default fallback style
    return `${baseClass} ${
      styles[`${type}Unassigned`] || styles.statusUnassigned
    }`;
  };

  // Get display text with special formatting for certain values
  const getDisplayText = (): string => {
    const lowerValue = value.toLowerCase();

    // Special case for "todo" to display as "To do"
    if (lowerValue === "todo") {
      return "To do";
    }

    // Special case for "inprogress" or "in-progress" to display as "In Progress"
    if (lowerValue === "inprogress" || lowerValue === "in-progress") {
      return "In Progress";
    }

    // Special case for "inreview" or "in-review" to display as "In Review"
    if (lowerValue === "inreview" || lowerValue === "in-review") {
      return "In Review";
    }

    // For other values, capitalize first letter of each word
    return value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return <span className={getClassName()}>{getDisplayText()}</span>;
};

export default StatusBadge;
