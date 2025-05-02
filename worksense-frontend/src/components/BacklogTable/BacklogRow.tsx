// src/components/BacklogTable/BacklogRow.tsx
import React from "react";
import styles from "./BacklogRow.module.css";
import StatusBadge from "./StatusBadge";
import ActionMenu from "./ActionMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BacklogItem {
  id: string;
  title: string;
  status: string;
  type: string;
  assigneeId?: string | number | null;
  severity?: string;
  storyPoints?: number | null;
}

interface Member {
  userId: number;
  profilePicture?: string;
  nickname?: string;
}

interface BacklogRowProps {
  item: BacklogItem;
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
  
  // Get member info
  const memberInfo = assigneeId !== null ? memberMap.get(assigneeId) : null;

  return (
    <tr key={item.id}>
      <td>
        <div className="flex items-center gap-2">
          <span>{item.title}</span>
        </div>
      </td>
      <td>
        {item.status ? <StatusBadge type="status" value={item.status} /> : "-"}
      </td>
      <td>
        {memberInfo ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {memberInfo.profilePicture ? (
                <AvatarImage
                  src={memberInfo.profilePicture}
                  alt={memberInfo.nickname || "User"}
                />
              ) : null}
              <AvatarFallback>
                {memberInfo.nickname
                  ? memberInfo.nickname.charAt(0).toUpperCase()
                  : assigneeId?.toString().charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
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
