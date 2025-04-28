// src/components/BacklogTable/PriorityBadge.tsx
import { FC } from "react";
import { getPriorityStyle } from "./utils";
import styles from "./PriorityBadge.module.css";

interface PriorityBadgeProps {
  priority?: string;
}

export const PriorityBadge: FC<PriorityBadgeProps> = ({ priority }) => {
  return (
    <span className={`${styles.badge} ${getPriorityStyle(priority, styles)}`}>
      {priority || "Sin prioridad"}
    </span>
  );
};