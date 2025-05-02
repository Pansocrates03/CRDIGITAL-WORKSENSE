// src/components/BacklogTable/EpicRow.tsx
import React, { FC } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import styles from "../../pages/BacklogTable/BacklogTablePage.module.css";
import ActionMenu from "./ActionMenu";
import { BacklogItemType } from "@/types/BacklogItemType";

interface EpicRowProps {
  epic: BacklogItemType;
  isExpanded: boolean;
  onToggle: (epicId: string) => void;
  colSpan: number;
  onEdit?: (epic: BacklogItemType) => void;
  onDelete?: (epicId: string) => void;
  onGenerateStories?: (epicId: string, epicName: string) => void;
}

export const EpicRow: FC<EpicRowProps> = ({
  epic,
  isExpanded,
  onToggle,
  colSpan,
  onEdit = () => console.log("Edit epic:", epic.id),
  onDelete = () => console.log("Delete epic:", epic.id),
  onGenerateStories,
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
          <span>{epic.name}</span>
          <span className="text-muted-foreground ml-2">
            ({epic.subItems?.length || 0}{" "}
            {epic.subItems?.length === 1 ? "story" : "stories"})
          </span>
          <span className="mr-2">
            {isExpanded ? (
              <ChevronDown size={16} className="text-gray-500" />
            ) : (
              <ChevronRight size={16} className="text-gray-500" />
            )}
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
          onGenerateStories={
            onGenerateStories
              ? () => onGenerateStories(epic.id, epic.name)
              : undefined
          }
          isEpic={true}
        />
      </td>
    </tr>
  );
};
