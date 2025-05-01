import React from "react";
import "./AvatarGroup.css"; // We'll create this CSS file next

// Limit the number of visible avatars
const MAX_VISIBLE_AVATARS = 3;

function AvatarGroup({ assignees = [] }) {
  if (!assignees || assignees.length === 0) {
    return null; // Don't render if no assignees
  }

  const visibleAssignees = assignees.slice(0, MAX_VISIBLE_AVATARS);
  const hiddenCount = assignees.length - visibleAssignees.length;

  return (
    <div className="avatar-group">
      {visibleAssignees.map((assignee) => (
        <img
          key={assignee.id}
          src={assignee.avatarUrl} // Provide a default fallback
          alt={assignee.name || "Assignee"}
          title={assignee.name || assignee.id} // Tooltip on hover
          className="avatar-group__avatar"
        />
      ))}
      {hiddenCount > 0 && (
        <span className="avatar-group__more">+{hiddenCount}</span>
      )}
    </div>
  );
}

export default AvatarGroup;
