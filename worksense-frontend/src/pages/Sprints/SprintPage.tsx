// Core imports
import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from "react-router-dom";
import QueryKeys from "@/utils/QueryKeys.ts";

// Hooks
import { useSprints } from "@/hooks/useSprintData";
import { useDeleteSprint } from "@/hooks/useSprintData";

// Services
import { projectService } from "@/services/projectService.ts";
import { sprintService } from "@/services/sprintService.ts";

// Types
import { Sprint } from "@/types/SprintType";
import BacklogItemType from "@/types/BacklogItemType.ts";

// Component Imports
import SprintSelectionView from "./components/SprintSelectionView/SprintSelectionView";
import BoardView from "./components/BoardView/BoardView";
import OverviewView from "./components/OverviewView/OverviewView";
import TableView from "./components/TableView/TableView";
import Tabs from "./components/Tabs/Tabs";
import "./components/styles/SprintPage.css";
import DeleteConfirmationModal from "@/components/ui/deleteConfirmationModal/deleteConfirmationModal";

// Import necessary CSS files
import "./components/TaskColumn/TaskColumn.css";
import "./components/TaskCard/TaskCard.css";
import "./components/StatusTag/StatusTag.css";
import "./components/PriorityTag/PriorityTag.css";
import "./components/avatarGroup/AvatarGroup.css";

const DEFAULT_COLUMNS = [
  { id: 'sprint_backlog', title: 'Sprint Backlog' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'done', title: 'Done' }
];

const navigationTabs = [
  { id:"sprints", label: "Sprint Selection" },
  { id: "overview", label: "Overview" },
  { id: "board", label: "Board" },
  { id: "table", label: "Table" },
];

const SprintPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { id: projectId } = useParams<{ id: string }>();

  // Fetch userStories
  const { isLoading: userStoriesLoading, data: userStories, error: userStoriesError } = useQuery({
    queryKey: [QueryKeys.userStories],
    queryFn: () => sprintService.getUserStories(projectId ?? "", selectedSprint)
  });

  // Get all sprints hook
  const { data: sprints, error: sprintsError, isLoading: sprintsLoading } = useSprints(projectId ?? "");

  console.log("USER STORIES", userStories)

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

  // Convert userStories to tasks when userStories data changes
  useEffect(() => {
    if (userStories && projectId) {
      const userStoryTasks: BacklogItemType[] = userStories.map(story => ({
        id: story.id,
        projectId: projectId,
        name: story.name || '',
        description: story.description || null,
        status: story.status || 'new',
        priority: story.priority || 'medium',
        type: 'story',
        createdAt: story.createdAt || new Date().toISOString(),
        updatedAt: story.updatedAt || new Date().toISOString(),
        sprint: selectedSprint,
        assigneeId: story.assigneeId || null,
        authorId: story.authorId || null,
        coverImage: story.coverImage || null,
        size: story.size || null,
        acceptanceCriteria: story.acceptanceCriteria || null
      }));
      setTasks(userStoryTasks);
    }
  }, [userStories, projectId, selectedSprint]);

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

  if (userStoriesError) { throw new Error("An error has occurred on SprintPage.tsx"); }
  if (userStoriesLoading) { return <div>Loading...</div> }
  if (!userStories) { throw new Error("Nothing received") }

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
            handleDeleteSprint(sprintToDelete.id); // Call delete function
          }
        }}
        title="Delete Sprint"
        message={`Are you sure you want to delete the sprint "${sprintToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default SprintPage;
