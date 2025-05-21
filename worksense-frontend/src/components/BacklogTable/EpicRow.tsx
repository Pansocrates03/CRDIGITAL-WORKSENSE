// src/components/BacklogTable/EpicRow.tsx
import React, {FC, useState} from "react";
import {ChevronDown, ChevronRight} from "lucide-react";
import StatusBadge from "./StatusBadge";
import styles from "../../pages/BacklogTable/BacklogTablePage.module.css";
import ActionMenu from "./ActionMenu";
import {AvatarDisplay} from "@/components/ui/AvatarDisplay";
import BacklogItemType from "@/types/BacklogItemType";
import MemberDetailed from "@/types/MemberDetailedType";

interface Story {
    id: string;
    name: string;
}

interface Epic {
    id: string;
    name: string;
    type: string;
    status: string;
    stories: Story[];
    assigneeId?: string | number | null;
}

interface EpicRowProps {
    epic: BacklogItemType;
    isExpanded: boolean;
    onToggle: (epicId: string) => void;
    colSpan: number;
    onEdit?: (epic: BacklogItemType) => void;
    onDelete?: (epicId: string) => void;

    onGenerateStories?: (epicId: string, epicName: string) => void;
    onViewDetails?: (epic: BacklogItemType) => void;
    memberMap: Map<number, MemberDetailed>;
    enableAiSuggestions: boolean;
}

export const EpicRow: FC<EpicRowProps> = ({
                                              epic,
                                              isExpanded,
                                              onToggle,
                                              colSpan,
                                              onEdit = () => console.log("Edit epic:", epic.id),
                                              onDelete = () => console.log("Delete epic:", epic.id),
                                              onGenerateStories,
                                              onViewDetails,
                                              memberMap,
                                              enableAiSuggestions,
                                          }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Handle toggle action
    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(epic.id);
    };

    // Handle view details
    const handleViewDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log("EpicRow: handleViewDetails llamado para epic:", epic.id);
        if (onViewDetails) {
            console.log("EpicRow: llamando a onViewDetails");
            onViewDetails(epic);
        } else {
            console.log("EpicRow: onViewDetails no está definido");
        }
    };

    // Determinar el ID asignado
    const assigneeId = epic.assigneeId
        ? typeof epic.assigneeId === "string"
            ? parseInt(epic.assigneeId)
            : Number(epic.assigneeId)
        : null;

    // Inline styles for the title instead of using a separate CSS module
    const titleStyle = {
        cursor: "pointer",
        transition: "color 0.2s ease",
        fontWeight: 500,
        position: "relative",
        display: "inline-block",
    } as React.CSSProperties;


    const memberInfo = assigneeId ? memberMap.get(assigneeId) : null;

    return (
        <tr className={styles.epicRowContainer}>
            <td>
                <div className="flex items-center gap-2">
          <span
              onClick={handleViewDetails}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
          >
            {epic.name}

          </span>
                    {epic.subItems && epic.subItems.length > 0 && (
                        <span
                            className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold bg-[var(--accent-pink)] text-white rounded-full"
                            title={`${epic.subItems.length} ${epic.subItems.length === 1 ? "story" : "stories"}`} // Add a title for accessibility/hover info
                        >
                        {epic.subItems.length}
                    </span>
                    )}
                    {epic.subItems && epic.subItems.length > 0 && (
                        <button
                            onClick={handleToggle}
                            className="ml-1 p-1 hover:bg-gray-200 rounded flex items-center justify-center"
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                            {isExpanded ? (
                                <ChevronDown size={16} className="text-gray-700"/>
                            ) : (
                                <ChevronRight size={16} className="text-gray-700"/>
                            )}
                        </button>
                    )}
                </div>
            </td>
            <td>
                {epic.status ? <StatusBadge type="status" value={epic.status}/> : "-"}
            </td>
            <td>-</td>
            <td>
                {assigneeId ? (
                    <div className="flex items-center gap-2">
                        <AvatarDisplay
                            user={{
                                name: memberInfo?.nickname || memberInfo?.name || `User ${assigneeId}`,
                                profilePicture: memberInfo?.profilePicture,
                            }}
                            size="sm"
                        />
                        <span className="text-sm">
              {memberInfo?.nickname || (memberInfo?.name ? memberInfo.name.split(' ')[0] : `User ${assigneeId}`)}
            </span>
                    </div>
                ) : (
                    "-"
                )}
            </td>
            <td>-</td>
            <td className={styles.actionButtons}>
                <ActionMenu
                    onEdit={(e) => {
                        e.stopPropagation();
                        onEdit(epic);
                    }}
                    onDelete={(e) => {
                        e.stopPropagation();
                        onDelete(epic.id);
                    }}
                    onViewDetails={onViewDetails ? () => onViewDetails(epic) : undefined}
                    onGenerateStories={
                        onGenerateStories && epic.id && epic.name
                            ? () => onGenerateStories(epic.id!, epic.name!)
                            : undefined
                    }
                    isEpic={true}
                    itemType="epic"
                    enableAiSuggestions={enableAiSuggestions}
                />
            </td>
        </tr>
    );
};
