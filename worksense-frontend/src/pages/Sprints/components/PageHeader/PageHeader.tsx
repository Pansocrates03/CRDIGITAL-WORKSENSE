// src/components/PageHeader.jsx
import React from "react";
import TeamAvatars from "../TeamAvatars/TeamAvatars";
import Tabs from "../Tabs/Tabs";
import "./PageHeader.css"; // Create this CSS file

function PageHeader({
  title,
  description,
  teamMembers = [],
  tabItems = [],
  activeTabId,
  onTabChange,
}) {
  return (
    <div className="page-header">
      {/* Top section: Title/Desc and Avatars */}
      <div className="page-header__top">
        <div className="page-header__title-group">
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        <TeamAvatars members={teamMembers} />
      </div>

      {/* Bottom section: Tabs */}
      <div className="page-header__tabs">
        <Tabs
          items={tabItems}
          activeTabId={activeTabId}
          onTabClick={onTabChange}
        />
      </div>
    </div>
  );
}

export default PageHeader;
