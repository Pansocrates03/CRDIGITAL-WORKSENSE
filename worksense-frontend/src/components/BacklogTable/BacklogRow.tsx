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

  const assigneeId =
    item.assigneeId !== undefined && item.assigneeId !== null
      ? Number(item.assigneeId)
      : null;
  const memberInfo = assigneeId !== null ? memberMap.get(assigneeId) : null;

  return (
    <tr key={item.id} className={indent ? styles.nestedRow : ""}>
      <td style={{ paddingLeft: indent ? "2.5rem" : undefined }}>
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
              <AvatarImage
                src={memberInfo.profilePicture}
                alt={memberInfo.nickname || "User"}
              />
              <AvatarFallback>
                {(memberInfo.nickname || "User").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{memberInfo.nickname}</span>
          </div>
        ) : (
          assigneeId || "-"
        )}
      </td>
      <td>{extraInfo}</td>
      <td className={styles.actionButtons}>
        <ActionMenu onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  );
};

export default BacklogRow;
