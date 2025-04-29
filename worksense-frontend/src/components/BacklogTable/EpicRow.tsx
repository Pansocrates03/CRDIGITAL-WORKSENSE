// src/components/EpicRow.tsx
import { FC } from "react";
import styles from "./EpicRow.module.css";

interface EpicRowProps {
  epic: {
    id: string;
    title: string;
    stories: any[]; // Aquí esperamos un array de historias relacionadas
  };
  isExpanded: boolean;
  onToggle: (id: string) => void;
  colSpan: number;
}

export const EpicRow: FC<EpicRowProps> = ({ epic, isExpanded, onToggle, colSpan }) => {
  const hasStories = epic.stories && epic.stories.length > 0;

  return (
    <tr
      className={hasStories ? styles.epicRow : ""}
      onClick={() => hasStories && onToggle(epic.id)}
      style={{ cursor: hasStories ? "pointer" : "default", backgroundColor: "#f3f4f6", userSelect: "none" }}
    >
      <td colSpan={colSpan}>
        <div className={styles.epicTitle}>
          <span className={styles.expandIcon}>
            {hasStories ? (isExpanded ? "▼" : "▶") : ""}
          </span>
          <div className={styles.epicTitleText}>
            <strong>{epic.title}</strong>
            {hasStories && (
              <span className={styles.estimateBadge}>
                {epic.stories.length} story{epic.stories.length !== 1 ? "ies" : ""}
              </span>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};
