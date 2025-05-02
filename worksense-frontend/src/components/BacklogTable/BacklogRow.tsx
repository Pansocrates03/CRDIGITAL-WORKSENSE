// src/components/BacklogTable/BacklogRow.tsx
import React from "react";
import styles from "./BacklogRow.module.css";
import StatusBadge from "./StatusBadge";
import ActionMenu from "./ActionMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { BacklogItemType } from "@/types/BacklogItemType";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";

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
}

const BacklogRow: React.FC<BacklogRowProps> = ({
  item,
  indent = false,
  memberMap,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  let extraInfo = "-";
  if (item.type === "story") {
    extraInfo =
      item.size !== undefined && item.size !== null
        ? item.size.toString()
        : "-";
  } else if (item.type === "bug") {
    extraInfo = item.size || "-";
  }

  // Handle assigneeId conversion
  const assigneeId =
    item.assigneeId !== undefined && item.assigneeId !== null
      ? typeof item.assigneeId === "string"
        ? parseInt(item.assigneeId)
        : Number(item.assigneeId)
      : null;

  // Handle authorId conversion
  const authorId =
    item.authorId !== undefined && item.authorId !== null
      ? typeof item.authorId === "string"
        ? parseInt(item.authorId)
        : Number(item.authorId)
      : null;
  // Get member info
  const memberInfo = assigneeId !== null ? memberMap.get(assigneeId) : null;
  const authorInfo = authorId !== null ? memberMap.get(authorId) : null;

  // Inline styles for the title instead of using a separate CSS module
  const titleStyle = {
    cursor: "pointer",
    transition: "color 0.2s ease",
    fontWeight: item.type === "epic" ? 500 : "normal",
    position: "relative",
    display: "inline-block",
  } as React.CSSProperties;

  const titleHoverStyle = {
    ...titleStyle,
    color: "var(--primary-color, #ac1754)",
  } as React.CSSProperties;

  const [isHovered, setIsHovered] = React.useState(false);

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
        {item.status ? <StatusBadge type="status" value={item.status} /> : "-"}
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
        {item.type === "bug" && item.size
          ? item.size.toString()
          : item.type === "story" && item.size
          ? item.size.toString()
          : "-"}
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
          itemType={item.type}
        />
      </td>
    </tr>
  );
};

export default BacklogRow;
