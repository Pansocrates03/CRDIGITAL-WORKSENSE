import styles from "pages/BacklogTable/BacklogTable.module.css";

export const getStatusStyle = (status: string) => {
  switch (status) {
    case "Sprint Backlog":
      return styles.statusSprintBacklog;
    case "In Progress":
      return styles.statusInProgress;
    case "In Review":
      return styles.statusInReview;
    case "Done":
      return styles.statusDone;
    default:
      return styles.statusUnassigned;
  }
};

export const getPriorityStyle = (priority: string = "") => {
  switch (priority.toLowerCase()) {
    case "alta":
      return styles.priorityHigh;
    case "media":
      return styles.priorityMedium;
    case "baja":
      return styles.priorityLow;
    default:
      return styles.priorityUnset;
  }
};

export const getAvatarUrl = (name: string) => {
  const formattedName = name.replace(/\s+/g, "+");
  return `https://api.dicebear.com/7.x/initials/svg?seed=${formattedName}`;
};
