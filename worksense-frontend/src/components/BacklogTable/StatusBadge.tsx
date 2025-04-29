// src/components/BacklogTable/StatusBadge.tsx
import { FC } from "react";
import { getStatusStyle } from "./utils";
import styles from "./StatusBadge.module.css";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status }) => {
  return (
    <div className={styles.statusContainer}>
      <span className={`${styles.badge} ${getStatusStyle(status, styles)}`}>
        {status || "Unassigned"}
      </span>
    </div>
  );
};