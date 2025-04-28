// src/components/BacklogTable/LabelsList.tsx
import { FC } from "react";
import styles from "./LabelsList.module.css";

interface LabelsListProps {
  labels?: string[];
}

export const LabelsList: FC<LabelsListProps> = ({ labels }) => {
  if (!labels || labels.length === 0) {
    return <span>-</span>;
  }

  return (
    <div className={styles.labelsContainer}>
      {labels.map((label, idx) => (
        <span key={idx} className={`${styles.badge} ${styles.labelBadge}`}>
          {label}
        </span>
      ))}
    </div>
  );
};