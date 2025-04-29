// src/components/BacklogTable/AssigneeDisplay.tsx
import { FC } from "react";
import { getAvatarUrl } from "./utils";
import styles from "./AssigneeDisplay.module.css";

interface AssigneeDisplayProps {
  assignee: string;
}

export const AssigneeDisplay: FC<AssigneeDisplayProps> = ({ assignee }) => {
  return (
    <div className={styles.assigneeContainer}>
      <img
        src={getAvatarUrl(assignee)}
        alt={assignee}
        className={styles.avatar}
      />
      <span>{assignee || "-"}</span>
    </div>
  );
};