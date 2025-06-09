// src/components/BacklogTable/StatusBadge.tsx
import React, { FC } from "react";
import styles from "./StatusBadge.module.css";

interface StatusBadgeProps {
  type: "status" | "severity" | "priority";
  value: string;
}

const StatusBadge: FC<StatusBadgeProps> = ({ type, value }) => {
  // Normalize the value for CSS class compatibility
  const normalizeForClass = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/\s+/g, "") // Remove spaces
      .replace(/-/g, "") // Remove dashes
      .replace(/[^a-z0-9]/g, ""); // Remove any other special characters
  };

  // Create the class name based on type and normalized value
  const getClassName = (): string => {
    const baseClass = styles.badge;
    const normalizedValue = normalizeForClass(value);

    // Map common variations to their normalized forms
    const statusMap: Record<string, string> = {
      todo: "Todo",
      "to-do": "Todo",
      inprogress: "InProgress",
      "in-progress": "InProgress",
      inreview: "InReview",
      "in-review": "InReview",
      done: "Done",
      blocked: "Blocked",
      new: "New",
      unassigned: "Unassigned",
      active: "Todo", // Map project status to task status
      completed: "Done", // Map project status to task status
      inactive: "Blocked", // Map project status to task status
      "on-hold": "Blocked", // Map project status to task status
    };

    // Map priority variations to three levels
    const priorityMap: Record<string, string> = {
      highest: "High",
      high: "High",
      medium: "Medium",
      low: "Low",
      lowest: "Low",
    };

    // Get the normalized key based on type
    let statusKey;
    if (type === "priority") {
      statusKey = priorityMap[normalizedValue] || "Medium"; // Default to Medium if unknown
    } else {
      statusKey = statusMap[normalizedValue] || normalizedValue;
    }

    // Create the class name
    const typeClass = `${type}${statusKey}`;

    // Check if the class exists in our styles
    if (styles[typeClass]) {
      return `${baseClass} ${styles[typeClass]}`;
    }

    // Default fallback style
    return `${baseClass} ${
      styles[`${type}Unassigned`] || styles.statusUnassigned
    }`;
  };

  // Get display text with proper formatting
  const getDisplayText = (): string => {
    // Special cases for display text
    const displayMap: Record<string, string> = {
      todo: "To do",
      "to-do": "To do",
      inprogress: "In Progress",
      "in-progress": "In Progress",
      inreview: "In Review",
      "in-review": "In Review",
      active: "Active", // Keep original project status text
      completed: "Completed", // Keep original project status text
      inactive: "Inactive", // Keep original project status text
      "on-hold": "On Hold", // Keep original project status text
    };

    const lowerValue = value.toLowerCase();
    if (displayMap[lowerValue]) {
      return displayMap[lowerValue];
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
