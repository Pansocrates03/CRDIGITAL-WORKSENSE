// src/components/BacklogTable/BacklogRow.tsx
import React from "react";
import styles from "./BacklogRow.module.css";
import StatusBadge from "./StatusBadge";
import ActionMenu from "./ActionMenu";

import { BacklogItemType } from "@/types/BacklogItemType";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";

interface Member {
  userId: number;
  profilePicture?: string;
  nickname?: string;
}

interface BacklogRowProps {
  item: BacklogItemType;
  indent?: boolean;
  memberMap: Map<number, Member>;
  onEdit: () => void;
  onDelete: () => void;
}

const BacklogRow: React.FC<BacklogRowProps> = ({
  item,
  indent = false,
  memberMap,
  onEdit,
  onDelete,
}) => {
  let extraInfo = "-";
  if (item.type === "story") {
    extraInfo =
      item.storyPoints !== undefined && item.storyPoints !== null
        ? item.storyPoints.toString()
        : "-";
  } else if (item.type === "bug") {
    extraInfo = item.severity || "-";
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

  return (
    <tr key={item.id}>
      <td>
        <div className="flex items-center gap-2">
          <span>{item.name}</span>
          {authorInfo && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>by</span>
              <Avatar className="h-4 w-4">
                {authorInfo.profilePicture ? (
                  <AvatarImage
                    src={authorInfo.profilePicture}
                    alt={authorInfo.nickname || "Author"}
                  />
                ) : null}
                <AvatarFallback>
                  {authorInfo.nickname
                    ? authorInfo.nickname.charAt(0).toUpperCase()
                    : authorId?.toString().charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <span>{authorInfo.nickname || `User ${authorId}`}</span>
            </div>
          )}
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
                name: memberInfo.nickname || `User ${assigneeId}`,
                profilePicture: memberInfo.profilePicture
              }}
              size="sm"
            />
            <span className="text-sm">
              {memberInfo.nickname || `User ${assigneeId}`}
            </span>
          </div>
        ) : (
          assigneeId || "-"
        )}
      </td>
      <td>
        {item.type === "bug" && item.severity ? (
          <StatusBadge type="severity" value={item.severity} />
        ) : item.type === "story" && item.storyPoints ? (
          item.storyPoints.toString()
        ) : (
          "-"
        )}
      </td>
      <td className={styles.actionButtons}>
        <ActionMenu onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  );
};

export default BacklogRow;
