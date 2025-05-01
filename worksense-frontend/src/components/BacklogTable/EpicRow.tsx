// src/components/BacklogTable/EpicRow.tsx
import React, { FC } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import styles from "../../pages/BacklogTable/BacklogTablePage.module.css";
import ActionMenu from "./ActionMenu";

interface Story {
  id: string;
  title: string;
}

interface Epic {
  id: string;
  title: string;
  type: string;
  status: string;
  stories: Story[];
  assigneeId?: string | number | null;
}

interface EpicRowProps {
  epic: Epic;
  isExpanded: boolean;
  onToggle: (epicId: string) => void;
  colSpan: number;
  onEdit?: (epic: any) => void;
  onDelete?: (epicId: string) => void;
}

export const EpicRow: FC<EpicRowProps> = ({
  epic,
  isExpanded,
  onToggle,
  colSpan,
  onEdit = () => console.log("Edit epic:", epic.id),
  onDelete = () => console.log("Delete epic:", epic.id),
}) => {
  // Handle toggle action
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(epic.id);
  };

  return (
    <tr className={styles.epicRowContainer}>
      <td onClick={handleToggle}>
        <div className="flex items-center gap-2">
          <span className="mr-2">
            {isExpanded ? (
              <ChevronDown size={16} className="text-gray-500" />
            ) : (
              <ChevronRight size={16} className="text-gray-500" />
            )}
          </span>
          <span>{epic.title}</span>
          <span className="text-muted-foreground ml-2">
            ({epic.stories.length} stories)
          </span>
        </div>
      </td>
      <td>
        {epic.status ? <StatusBadge type="status" value={epic.status} /> : "-"}
      </td>
      <td>{epic.assigneeId ?? "-"}</td>
      <td>-</td> {/* Epic doesn't have story points/severity */}
      <td className={styles.actionButtons}>
        <ActionMenu
          onEdit={() => onEdit(epic)}
          onDelete={() => onDelete(epic.id)}
        />
      </td>
    </tr>
  );
};
