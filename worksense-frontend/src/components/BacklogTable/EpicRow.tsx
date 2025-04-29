// src/components/BacklogTable/EpicRow.tsx
import { FC } from "react";
import { Epic } from "./types";
import styles from "./EpicRow.module.css";

interface EpicRowProps {
  epic: Epic;
  isExpanded: boolean;
  onToggle: (epicId: string) => void;
  colSpan: number;
}

export const EpicRow: FC<EpicRowProps> = ({ 
  epic,
  isExpanded,
  onToggle,
  colSpan 
}) => {
  return (
    <tr
      className={styles.epicRow}
      onClick={() => onToggle(epic.id)}
    >
      <td
        colSpan={colSpan}
        className={styles.epicTitleCell}
      >
        <div className={styles.epicTitle}>
          <span className={styles.expandIcon}>
            {isExpanded ? "▼" : "▶"}
          </span>
          <div className={styles.epicTitleText}>
            <strong>{epic.title}</strong> #{epic.id}
            <span className={styles.estimateBadge}>
              {`0/${epic.stories.length}`}
            </span>
          </div>
        </div>
      </td>
    </tr>
  );
};