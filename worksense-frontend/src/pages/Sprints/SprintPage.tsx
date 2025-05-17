import React, { useState } from "react";
import BoardView from "./components/BoardView/BoardView";
import OverviewView from "./components/OverviewView/OverviewView";
import TableView from "./components/TableView/TableView";
import Tabs from "./components/Tabs/Tabs";
import "./components/styles/SprintPage.css";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from "react-router-dom";
import { projectService } from "@/services/projectService.ts";
import QueryKeys from "@/utils/QueryKeys.ts";

// Import necessary CSS files
import "./components/TaskColumn/TaskColumn.css";
import "./components/TaskCard/TaskCard.css";
import "./components/StatusTag/StatusTag.css";
import "./components/PriorityTag/PriorityTag.css";
import "./components/avatarGroup/AvatarGroup.css";
import BacklogItemType from "@/types/BacklogItemType.ts";
import { SelectInput } from "@/components/SelectInput/SelectInput";

const DEFAULT_COLUMNS = [
  { id: 'new', title: 'New' },
  { id: 'sprint_backlog', title: 'Sprint Backlog' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'done', title: 'Done' }
];

const navigationTabs = [
  { id: "overview", label: "Overview" },
  { id: "board", label: "Board" },
  { id: "table", label: "Table" },
];

const SprintPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { id: projectId } = useParams<{ id: string }>();

  // TODOS LOS HOOKS VAN AQUÍ
  const { isLoading, data, error } = useQuery<BacklogItemType[], Error>({
    queryKey: [QueryKeys.backlog, projectId],
    queryFn: () => projectService.fetchProjectItems(projectId ? projectId : "")
  });

  const handleCreateColumn = (columnName: string) => {
    // Crea un id único, por ejemplo usando Date.now()
    const newColumn = {
      id: columnName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
      title: columnName
    };
    setColumns(prev => [...prev, newColumn]);
  };

  const [tasks, setTasks] = useState<BacklogItemType[]>([]);
  const [activeTab, setActiveTab] = useState('board');
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);

  // Solo un useEffect para actualizar tasks
  React.useEffect(() => {
    if (data) setTasks(data);
  }, [data]);

  if (error) { throw new Error("An error has ocurred on SprintPage.tsx"); }
  if(isLoading){ return <div>Loading...</div> }
  if(!data){ throw new Error("Nothing received") }

  // Update tasks when data changes
  React.useEffect(() => {
    if (data) setTasks(data);
  }, [data]);


  
  const  handleTaskUpdate = async (
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
    let task = tasks.find(t => t.id === taskId); // find task
    if(!task) throw new Error("Task not found"); // Error handling
    task.status = newStatus
    await projectService.updateBacklogItem(projectId ? projectId : "",task) // Esperamos a que se actualice antes de invalidar

    // Se invalida el Query Client
    queryClient.invalidateQueries({ queryKey: [QueryKeys.backlog, projectId] })
  };
  

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderView = () => {
    switch (activeTab) {
      case 'board':
        return <BoardView
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          columns={columns}
          />;
      case 'overview':
        return <OverviewView tasks={tasks} />;
      case 'table':
        return <TableView tasks={tasks} />;
      default:
        return <BoardView tasks={tasks} onTaskUpdate={handleTaskUpdate} columns={columns} />;
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
          <SelectInput
          inputName="SPRINT"
          inputValue="s1"
          isRequired
          onChange={() => console.log("kml")}
          options={[
            {value: "s1", label: "Sprint 1"},
            {value:"s2", label: "Sprint 2"},
            {value:"s3", label: "Sprint 3"},
          ]}
          />
        </div>
      </div>

      <Tabs
        items={navigationTabs}
        activeTabId={activeTab}
        onTabClick={handleTabChange}
        handleCreateColumn={handleCreateColumn}
      />

      {renderView()}
    </div>
  );
};

export default SprintPage;
