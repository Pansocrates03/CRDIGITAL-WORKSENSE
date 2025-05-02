import React, { useState } from "react";
import { Task, initialTasks } from "./data.ts";
import BoardView from "./components/BoardView/BoardView";
import OverviewView from "./components/OverviewView/OverviewView";
import ListView from "./components/ListView/ListView";
import TableView from "./components/TableView/TableView";
import TimelineView from "./components/TimelineView/TimelineView";
import Tabs from "./components/Tabs/Tabs";
import TeamAvatars from "./components/TeamAvatars/TeamAvatars";
import "./components/styles/SprintPage.css";

// Import necessary CSS files
import "./components/TaskColumn/TaskColumn.css";
import "./components/TaskCard/TaskCard.css";
import "./components/StatusTag/StatusTag.css";
import "./components/PriorityTag/PriorityTag.css";
import "./components/avatarGroup/AvatarGroup.css";
import PageHeader from "./components/PageHeader/PageHeader";

const AVATAR_URL = "https://avatar.iran.liara.run/public";

interface TeamMember {
  id: string;
  name: string;
  avatarUrl: string;
}

const sampleTeamMembers: TeamMember[] = [
  { id: "u1", name: "Jon A.", avatarUrl: AVATAR_URL },
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

const SprintPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTab, setActiveTab] = useState('board');

  const handleTaskUpdate = (taskId: string, newStatus: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderView = () => {
    switch (activeTab) {
      case 'board':
        return <BoardView tasks={tasks} onTaskUpdate={handleTaskUpdate} />;
      case 'overview':
        return <OverviewView tasks={tasks} />;
      case 'list':
        return <ListView tasks={tasks} />;
      case 'table':
        return <TableView tasks={tasks} />;
      case 'timeline':
        return <TimelineView tasks={tasks} />;
      default:
        return <BoardView tasks={tasks} onTaskUpdate={handleTaskUpdate} />;
    }
  };

  return (
    <div className="sprint-page">
      <div className="sprint-page__header">
        <div className="sprint-page__header-content">
          <h1 className="sprint-page__title">Tasks</h1>
          <p className="sprint-page__description">Sprint board for tracking project tasks and progress</p>
        </div>
        <div className="sprint-page__team">
          <TeamAvatars members={sampleTeamMembers} />
        </div>
      </div>

      <Tabs
        items={navigationTabs}
        activeTabId={activeTab}
        onTabClick={handleTabChange}
      />

      {renderView()}
    </div>
  );
};

export default SprintPage;
