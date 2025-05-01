// src/components/TeamAvatars.jsx
import React from "react";
import "./TeamAvatars.css"; // Create this CSS file

const MAX_VISIBLE = 4; // Max avatars before showing +N

function TeamAvatars({ members = [] }) {
  if (!members || members.length === 0) {
    return null;
  }

  const visibleMembers = members.slice(0, MAX_VISIBLE);
  const hiddenCount = members.length - visibleMembers.length;

  return (
    <div className="team-avatars">
      {visibleMembers.map((member) => (
        <img
          key={member.id}
          src={member.avatarUrl || "/avatars/default-avatar.png"}
          alt={member.name || "Team member"}
          title={member.name || member.id}
          className="team-avatars__avatar"
        />
      ))}
      {hiddenCount > 0 && (
        <span className="team-avatars__more">+{hiddenCount}</span>
      )}
    </div>
  );
}

export default TeamAvatars;
