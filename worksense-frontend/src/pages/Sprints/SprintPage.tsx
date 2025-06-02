// Core imports
import React, { useState } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from "react-router-dom";
import { projectService } from "@/services/projectService.ts";
import QueryKeys from "@/utils/QueryKeys.ts";
import { useSprints } from "@/hooks/useSprintData";
import { useDeleteSprint } from "@/hooks/useSprintData";
import { Sprint } from "@/types/SprintType";

// Component Imports
import SprintSelectionView from "./components/SprintSelectionView/SprintSelectionView";
import BoardView from "./components/BoardView/BoardView";
import OverviewView from "./components/OverviewView/OverviewView";
import TableView from "./components/TableView/TableView";
import Tabs from "./components/Tabs/Tabs";
import "./components/styles/SprintPage.css";

// Modals
import DeleteConfirmationModal from "@/components/ui/deleteConfirmationModal/deleteConfirmationModal";

// Import necessary CSS files
import "./components/TaskColumn/TaskColumn.css";
import "./components/TaskCard/TaskCard.css";
import "./components/StatusTag/StatusTag.css";
import "./components/PriorityTag/PriorityTag.css";
import "./components/avatarGroup/AvatarGroup.css";
import BacklogItemType from "@/types/BacklogItemType.ts";
import { SelectInput } from "@/components/SelectInput/SelectInput";

const DEFAULT_COLUMNS = [
  { id: 'sprint_backlog', title: 'Sprint Backlog' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'done', title: 'Done' }
];

const navigationTabs = [
  { id: "sprints", label: "Sprint Selection" },
  { id: "overview", label: "Overview", requiresSprint: true },
  { id: "board", label: "Board", requiresSprint: true },
  { id: "table", label: "Table", requiresSprint: true },
];

const SprintPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { id: projectId } = useParams<{ id: string }>();
  // TODOS LOS HOOKS VAN AQUÍ
  const { isLoading, data, error } = useQuery<BacklogItemType[], Error>({
    queryKey: [QueryKeys.backlog, projectId],
    queryFn: () => projectService.fetchProjectItems(projectId ? projectId : "")
  });


  const { data: sprints, error: sprintsError, isLoading: sprintsLoading } = useSprints(projectId ?? "");

  const [tasks, setTasks] = useState<BacklogItemType[]>([]);
  const [activeTab, setActiveTab] = useState('sprints');
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);

  // Delete sprint hook
  const { mutate: deleteSprintMutation } = useDeleteSprint(projectId ?? "");

  // Store selected sprint
  const [selectedSprint, setSelectedSprint] = useState<string>('');

  // DELETE MODAL STATES
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null);

  // Handle Delete Sprint
  const handleDeleteSprint = (sprintId: string) => {
    if (sprintId) {
      deleteSprintMutation(sprintId); // Call mutation to delete the sprint
      setDeleteModalOpen(false); // Close the modal after deletion
    }
  };

  const handleCreateColumn = (columnName: string) => {
    // Create a unique id, for example using Date.now()
    const newColumn = {
      id: columnName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
      title: columnName
    };
    setColumns(prev => [...prev, newColumn]);
  };

  const getItemChildren = (item: BacklogItemType): BacklogItemType[] => {
    if (!item.subItems || item.subItems.length === 0) {
      return [item];
    }
    return [
      item,
      ...item.subItems.flatMap(getItemChildren)
    ];
  };

  // Update tasks when data changes
  React.useEffect(() => {
    if (data) {
      console.log("DATA", data);
      // Flatten all subitems
      let flattenedData = data.flatMap(getItemChildren);

      // Filter out EPIC items
      let filteredData = flattenedData.filter(item => item.type !== "epic");

      // Set tasks state
      setTasks(filteredData);
    }
  }, [data]);

  const handleTaskUpdate = async (
    taskId: string,
    newStatus: BacklogItemType["status"]
  ) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    let task = tasks.find(t => t.id === taskId); // Find task
    if(!task) throw new Error("Task not found"); // Error handling
    task.status = newStatus
    await projectService.updateBacklogItem(projectId ? projectId : "", task); // Wait for update

    // Invalidate Query Client
    queryClient.invalidateQueries({ queryKey: [QueryKeys.backlog, projectId] });
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderView = () => {
    switch (activeTab) {
      case 'sprints':
        return <SprintSelectionView 
          sprints={sprints} 
          selectedSprintId={selectedSprint} 
          onSelectSprint={(id) => {
            setSelectedSprint(id);
            setActiveTab('overview');
          }} 
          onDeleteSprint={(sprint) => {
            setSprintToDelete(sprint);
            setDeleteModalOpen(true);
          }}
        />;
      case 'board':
        return <BoardView tasks={tasks} onTaskUpdate={handleTaskUpdate} columns={columns} />;
      case 'overview':
        return <OverviewView tasks={tasks} />;
      case 'table':
        return <TableView tasks={tasks} />;
      default:
        return <BoardView tasks={tasks} onTaskUpdate={handleTaskUpdate} columns={columns} />;
    }
  };

  if (error) { throw new Error("An error has occurred on SprintPage.tsx"); }
  if (isLoading) { return <div>Loading...</div> }
  if (!data) { throw new Error("Nothing received") }

  return (
    <div className="sprint-page">
      <div className="sprint-page__header">
        <div className="sprint-page__header-content">
          <h1 className="sprint-page__title">Tasks</h1>
          <p className="sprint-page__description">Sprint board for tracking project tasks and progress</p>
        </div>
      </div>

      {/* Tabs Component */}
      <Tabs
        items={navigationTabs}
        activeTabId={activeTab}
        onTabClick={handleTabChange}
        handleCreateColumn={handleCreateColumn}
        projectId={projectId ?? ""}
        selectedSprintId={selectedSprint}
      />

      {/* Render active view based on the selected tab */}
      {renderView()}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSprintToDelete(null);
        }}
        onConfirm={() => {
          if (sprintToDelete) {
            handleDeleteSprint(sprintToDelete.id);
          }
        }}
        title="Delete Sprint"
        message={`Are you sure you want to delete the sprint "${sprintToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default SprintPage;
