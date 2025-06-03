// src/components/BacklogTable/BacklogRow.tsx
import React from "react";
import styles from "./BacklogRow.module.css";
import StatusBadge from "./StatusBadge";
import ActionMenu from "./ActionMenu";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";
import BacklogItemType from "@/types/BacklogItemType";

interface Member {
  userId: number;
  profilePicture?: string;
  nickname?: string;
  name?: string;
}

interface BacklogRowProps {
  item: BacklogItemType;
  indent?: boolean;
  memberMap: Map<number, Member>;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  enableAiSuggestions: boolean;
  sprints: { id: string; name: string }[];
  hasPermissions?: boolean;
}

const BacklogRow: React.FC<BacklogRowProps> = ({
  item,
  indent = false,
  memberMap,
  onEdit,
  onDelete,
  onViewDetails,
  enableAiSuggestions,
  sprints,
  hasPermissions,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  // Handle assigneeId conversion
  const assigneeId =
    item.assigneeId !== undefined && item.assigneeId !== null
      ? typeof item.assigneeId === "string"
        ? parseInt(item.assigneeId, 10)
        : Number(item.assigneeId)
      : null;

  // Handle authorId conversion
  const authorId =
    item.authorId !== undefined && item.authorId !== null
      ? typeof item.authorId === "string"
        ? parseInt(item.authorId, 10)
        : Number(item.authorId)
      : null;

  // Get member info
  const memberInfo = assigneeId !== null ? memberMap.get(assigneeId) : null;
  const authorInfo = authorId !== null ? memberMap.get(authorId) : null;

  // Inline styles for the title
  const titleStyle: React.CSSProperties = {
    cursor: "pointer",
    transition: "color 0.2s ease",
    fontWeight: item.type === "epic" ? 500 : "normal",
    position: "relative",
    display: "inline-block",
  };

  const titleHoverStyle: React.CSSProperties = {
    ...titleStyle,
    color: "var(--primary-color, #ac1754)",
  };

    return (
        <tr key={item.id} className={indent ? styles.indentedRow : ""}>
            <td>
                <div className="flex items-center gap-2">
                    <span
                        style={isHovered ? titleHoverStyle : titleStyle}
                        onClick={onViewDetails}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {item.name || "-"}
                        {isHovered && (
                            <span
                                style={{
                                    position: "absolute",
                                    width: "100%",
                                    height: "1px",
                                    bottom: "0",
                                    left: "0",
                                    backgroundColor: "var(--primary-color, #ac1754)",
                                }}
                            />
                        )}
                    </span>
                </div>
            </td>
            <td>
                {item.status ? <StatusBadge type="status" value={item.status}/> : "-"}
            </td>
            <td>
                {item.sprint ? (sprints.find(s => s.id === item.sprint)?.name || "-") : "-"}
            </td>
            <td>
                {memberInfo ? (
                    <div className="flex items-center gap-2">
                        <AvatarDisplay
                            user={{
                                name:
                                    memberInfo.nickname ||
                                    memberInfo.name ||
                                    `User ${assigneeId}`,
                                profilePicture: memberInfo.profilePicture,
                            }}
                            size="sm"
                        />
                        <span className="text-sm">
                            {memberInfo.nickname ||
                                (memberInfo.name
                                    ? memberInfo.name.split(" ")[0]
                                    : `User ${assigneeId}`)}
                        </span>
                    </div>
                ) : (
                    "-"
                )}
            </td>
            <td>
                {item.size ? item.size.toString() : "-"}
            </td>
            <td className={styles.actionButtons}>
                <ActionMenu
                    onEdit={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    onDelete={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    onViewDetails={onViewDetails}
                    itemType={item.type || undefined}
                    enableAiSuggestions={enableAiSuggestions}
                />
            </td>
        </tr>
    );
};

export default BacklogRow;
