import React, { useState } from "react";

// Import the main TaskBoard component
import TaskBoard from "./components/TaskBoard/TaskBoard"; // Adjust path if needed

// Import the data
import { initialBoardData_v2 } from "./data.js"; // Adjust path if needed

// Import necessary CSS files - ensure these exist and paths are correct
// Webpack/Vite usually handle CSS imported within components, but adding
// the top-level ones here ensures they're loaded.
import "./components/TaskColumn/TaskColumn.css"; // Column styles
import "./components/TaskCard/TaskCard.css"; // Card styles
import "./components/StatusTag/StatusTag.css"; // Tag styles
import "./components/PriorityTag/PriorityTag.css"; // Tag styles
import "./components/avatarGroup/AvatarGroup.css";
import PageHeader from "./components/PageHeader/PageHeader";

const AVATAR_URL = "https://avatar.iran.liara.run/public";
// --- Sample Data for Header ---
const sampleTeamMembers = [
  { id: "u1", name: "Jon A.", avatarUrl: AVATAR_URL }, // Replace with actual paths
  { id: "u2", name: "Jane B.", avatarUrl: AVATAR_URL },
  { id: "u3", name: "Chris C.", avatarUrl: AVATAR_URL },
  { id: "u4", name: "Sara D.", avatarUrl: AVATAR_URL },
  { id: "u5", name: "Mike E.", avatarUrl: AVATAR_URL },
];

const navigationTabs = [
  { id: "overview", label: "Overview" },
  { id: "board", label: "Board" },
  { id: "list", label: "List" },
  { id: "table", label: "Table" },
  { id: "timeline", label: "Timeline" },
];

function SprintPage() {
  const [boardData, setBoardData] = useState(initialBoardData_v2);
  const [activeTab, setActiveTab] = useState("board");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    console.log("Active tab:", tabId);
  };

  return (
    <div className="task-board-page">
      <PageHeader
        title="Tasks"
        description="Short description will be placed here"
        teamMembers={sampleTeamMembers}
        tabItems={navigationTabs}
        activeTabId={activeTab}
        onTabChange={handleTabChange}
      />

      <TaskBoard columns={boardData} />
    </div>
  );
}

export default SprintPage;
