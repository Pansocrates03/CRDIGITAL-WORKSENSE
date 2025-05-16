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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from "react-router-dom";
import { projectService } from "@/services/projectService.ts";

// Import necessary CSS files
import "./components/TaskColumn/TaskColumn.css";
import "./components/TaskCard/TaskCard.css";
import "./components/StatusTag/StatusTag.css";
import "./components/PriorityTag/PriorityTag.css";
import "./components/avatarGroup/AvatarGroup.css";
import BacklogItemType from "@/types/BacklogItemType.ts";

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
  const queryClient = useQueryClient();

  const { id: projectId } = useParams<{ id: string }>();
  
  if(!projectId) throw new Error("There is no project ID");

  const { isLoading, data, error } = useQuery<BacklogItemType[], Error>({
    queryKey: ["backlog", projectId],
    queryFn: () => projectService.fetchProjectItems(projectId)
  });

  if (error) {
    throw new Error("An error has ocurred on SprintPage.tsx");
  }

  if(isLoading){
    return <div>Loading...</div>
  }

  if(!data){
    throw new Error("Nothing received")
  }




  const [tasks, setTasks] = useState<BacklogItemType[]>(data);
  const [activeTab, setActiveTab] = useState('board');

  
  const handleTaskUpdate = (
    taskId: string,
    newStatus: BacklogItemType["status"]
  ) => {
    // Se realiza el update de forma manual
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    // Se actualiza la bdd
    projectService.updateBacklogItem(projectId,taskId)

    // Se invalida el Query Client
    queryClient.invalidateQueries({ queryKey: ["backlog", projectId] })
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
