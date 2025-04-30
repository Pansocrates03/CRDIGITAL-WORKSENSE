// src/components/BacklogTable/EpicRow.tsx
import React, { FC } from "react";
import { FaTrashAlt, FaPencilAlt } from "react-icons/fa";
import styles from "./EpicRow.module.css";

interface Story {
  id: string;
  title: string;
  // otros campos relevantes
}

interface Epic {
  id: string;
  title: string;
  type: string;
  status: string;
  stories: Story[];
  // otros campos relevantes
}

interface EpicRowProps {
  epic: Epic;
  isExpanded: boolean;
  onToggle: (epicId: string) => void;
  colSpan: number;
  onEdit?: (epicId: string) => void;
  onDelete?: (epicId: string) => void;
}

export const EpicRow: FC<EpicRowProps> = ({ 
  epic, 
  isExpanded, 
  onToggle, 
  colSpan,
  onEdit = () => console.log('Edit epic:', epic.id),
  onDelete = () => console.log('Delete epic:', epic.id)
}) => {
  // Prevent click propagation when clicking the action buttons
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <tr className={styles.epicRow} onClick={() => onToggle(epic.id)}>
      <td colSpan={colSpan - 1}>
        <div className={styles.epicHeader}>
          <span className={styles.expandIcon}>
            {isExpanded ? "▼" : "►"}
          </span>
          {epic.title}
          <span className={styles.storiesCount}>
            ({epic.stories.length} stories)
          </span>
        </div>
      </td>
      <td className={styles.epicActions} onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={(e) => handleActionClick(e, () => onEdit(epic.id))} 
          className={styles.button}
        >
          <FaPencilAlt />
        </button>
        <button 
          onClick={(e) => handleActionClick(e, () => onDelete(epic.id))} 
          className={`${styles.button} ${styles.trashButton}`}
        >
          <FaTrashAlt />
        </button>
      </td>
    </tr>
  );
};