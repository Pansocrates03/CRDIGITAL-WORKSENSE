// src/pages/sprints/SprintPage.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, DropResult } from "react-beautiful-dnd";

// Import Services and Types
import { projectService } from "@/services/projectService";
import { Task } from "@/types/Task";
import { Sprint } from "@/types/Sprint";
import ProjectDetails from "@/types/ProjectType";
import MemberDetailed from "@/types/MemberDetailedType";

// Import Components
import TaskBoard from "../../../components/sprints/tasks/taskboard/TaskBoard";
import PageHeader from "@/components/sprints/header/PageHeader";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";

// Import CSS (keep your imports)
import "./SprintPage.css";
import "@/components/sprints/tasks/taskboard/TaskBoard.css";
import "@/components/sprints/tasks/taskcolumn/TaskColumn.css";
import "@/components/sprints/tasks/taskcard/TaskCard.css";
import "@/components/sprints/status/StatusTag.css";
import "@/components/sprints/priority/PriorityTag.css";
import "@/components/sprints/avatar/AvatarGroup.css";
import { toast } from "sonner";

// --- Configuration ---
const AVATAR_URL = "https://avatar.iran.liara.run/public";

const BOARD_COLUMNS = [
  { id: "ToDo", title: "To Do" },
  { id: "InProgress", title: "In Progress" },
  { id: "Review", title: "Review" },
  { id: "Done", title: "Done" },
];

const navigationTabs = [
  // { id: "overview", label: "Overview" },
  { id: "board", label: "Board" },
  // { id: "list", label: "List" },
];
// --- End Configuration ---

// Helper function (keep transformTasksToBoardData as before)
const transformTasksToBoardData = (tasks: Task[]) => {
  const columnsMap = new Map(
    BOARD_COLUMNS.map((col) => [col.id, { ...col, tasks: [] as Task[] }])
  );
  tasks.forEach((task) => {
    const statusKey = task.status as keyof (typeof BOARD_COLUMNS)[number]["id"];
    if (statusKey && columnsMap.has(statusKey)) {
      columnsMap.get(statusKey)?.tasks.push(task);
    } else {
      console.warn(
        `Task ${task.id} has unknown or missing status: ${task.status}.`
      );
    }
  });
  columnsMap.forEach((column) => {
    column.tasks.sort((a, b) => (a.order || 0) - (b.order || 0));
  });
  return Array.from(columnsMap.values());
};

// --- SprintPage Component ---
function SprintPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State Management
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(
    null
  );
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<MemberDetailed[]>([]);
  const [isLoadingProject, setIsLoadingProject] = useState<boolean>(true);
  const [isLoadingSprint, setIsLoadingSprint] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("board");

  // Derived state for board data
  const boardData = useMemo(() => transformTasksToBoardData(tasks), [tasks]);

  // --- Effect 1: Fetch Project Details & Select First Sprint ---
  useEffect(() => {
    if (!projectId) {
      setError("Project ID is missing from the URL.");
      setIsLoadingProject(false);
      console.error("Missing projectId in URL params");
      return;
    }

    // Rename function for clarity
    const fetchProjectAndSelectSprint = async () => {
      setIsLoadingProject(true);
      setSelectedSprintId(null);
      setSelectedSprint(null);
      setTasks([]);
      setError(null);
      console.log(`Fetching initial data for Project: ${projectId}`);

      try {
        const [projDetails, allSprints, members] = await Promise.all([
          projectService.fetchProjectDetails(projectId),
          // *** CHANGE: Still fetch sprints, sort order depends on API (default is endDate desc) ***
          projectService.getSprints(projectId),
          projectService.fetchProjectMembersDetailed(projectId),
        ]);

        setProjectDetails(projDetails);
        setTeamMembers(members);

        // *** CHANGE: Select the FIRST sprint if available ***
        if (allSprints && allSprints.length > 0) {
          const firstSprint = allSprints[0]; // Take the first one returned by the API
          console.log(
            `Selecting first sprint found: ID=${firstSprint.id}, Name=${firstSprint.name}, Status=${firstSprint.status}`
          );
          setSelectedSprintId(firstSprint.id); // Trigger the task fetch effect
          setSelectedSprint(firstSprint); // Store details for header
        } else {
          // No sprints found for this project
          console.warn("No sprints found for this project.");
          setError("No sprints found for this project. Please create one.");
          // No sprint ID will be set, so the task fetch effect won't run.
        }
      } catch (err: any) {
        console.error("Error fetching project/sprints:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load project data.";
        setError(errorMessage);
      } finally {
        setIsLoadingProject(false);
      }
    };

    fetchProjectAndSelectSprint();
  }, [projectId]); // Re-run ONLY if projectId changes

  // --- Effect 2: Fetch Tasks for the Selected Sprint (No change needed here) ---
  useEffect(() => {
    if (!projectId || !selectedSprintId) {
      if (!selectedSprintId) setTasks([]);
      return;
    }

    const fetchTasks = async () => {
      setIsLoadingSprint(true);
      setError(null);
      try {
        const sprintTasks = await projectService.getTasksForSprint(
          projectId,
          selectedSprintId
        );
        setTasks(sprintTasks);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load sprint tasks.";
        setError(errorMessage);
        setTasks([]);
      } finally {
        setIsLoadingSprint(false);
      }
    };

    fetchTasks();
  }, [projectId, selectedSprintId]); // Re-run if projectId or the SELECTED sprintId changes

  // Event Handlers (keep handleTabChange as before)
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // *** NEW: onDragEnd Handler for Drag and Drop ***
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId: taskId } = result;

      // 1. Check if drop is valid
      // - Dropped outside any droppable area
      // - Dropped back into the exact same position
      if (
        !destination ||
        (destination.droppableId === source.droppableId &&
          destination.index === source.index)
      ) {
        console.log("Drag ended, no change.");
        return;
      }

      // 2. Check if required IDs are available
      if (!projectId || !taskId) {
        console.error("Missing projectId or taskId for drag operation.");
        toast.error("Cannot update task: missing critical information.");
        return;
      }

      // 3. Get the new status from the destination column ID
      const newStatus = destination.droppableId;
      // Optional: Validate if newStatus is a valid status from BOARD_COLUMNS?
      if (!BOARD_COLUMNS.some((col) => col.id === newStatus)) {
        console.error(`Invalid destination status: ${newStatus}`);
        toast.error("Invalid drop target column.");
        return;
      }

      // --- Optimistic Update ---
      // Find the original task and its index
      const originalTask = tasks.find((t) => t.id === taskId);
      if (!originalTask) return; // Should not happen if draggableId is correct

      const originalStatus = originalTask.status; // Store original status for potential revert

      // Update local state *immediately* for better UX
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      // The boardData will automatically recalculate due to useMemo dependency on tasks

      // 4. Call the API to update the status
      console.log(
        `Attempting to update task ${taskId} to status ${newStatus} for project ${projectId}`
      );
      try {
        await projectService.updateTaskStatus(projectId, taskId, newStatus);
        console.log(
          `Task ${taskId} status updated successfully to ${newStatus}`
        );
        toast.success(`Task moved to ${newStatus}!`); // Success feedback

        // Optional: Fetch tasks again to ensure consistency? Usually not needed if API response is trusted.
        // setTasks(await projectService.getTasksForSprint(projectId, selectedSprintId));
      } catch (err: any) {
        console.error(`Error updating task ${taskId} status:`, err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to update task status.";
        toast.error(`Error: ${errorMessage}`); // Error feedback

        // --- Revert Optimistic Update on Error ---
        setTasks((currentTasks) =>
          currentTasks.map(
            (task) =>
              task.id === taskId ? { ...task, status: originalStatus } : task // Revert to original status
          )
        );
        setError(errorMessage); // Optionally display error more prominently
      }
    },
    [projectId, tasks]
  ); // Dependencies: projectId for API call, tasks for optimistic update/revert

  // --- Render Logic ---
  if (isLoadingProject) {
    return <LoadingSpinner message="Loading project details..." />;
  }

  // Handle error case first
  if (error && !isLoadingSprint) {
    return <ErrorDisplay title="Error" message={error} />;
  }

  // Handle case where no sprint was found/selected (after initial load)
  if (!selectedSprintId && !isLoadingProject) {
    return (
      <ErrorDisplay
        title="No Sprints Found"
        message="Could not find any sprints for this project."
      />
    );
  }

  // Prepare data for child components
  const headerTeamMembers = teamMembers
    .map((member) => ({
      id: member.userId,
      name: member.name || member.email.split("@")[0],
      avatarUrl: member.avatarUrl || AVATAR_URL,
    }))
    .slice(0, 5);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="app-container">
        <PageHeader
          title={selectedSprint?.name || projectDetails?.name || "Sprint Board"}
          description={
            selectedSprint?.goal ||
            projectDetails?.description ||
            "Manage sprint tasks"
          }
          teamMembers={headerTeamMembers}
          tabItems={navigationTabs}
          activeTabId={activeTab}
          onTabChange={handleTabChange}
        />

        <main className="app-main-content">
          {isLoadingSprint ? (
            <LoadingSpinner message="Loading tasks..." />
          ) : (
            <>
              {activeTab === "board" && <TaskBoard columns={boardData} />}
              {activeTab === "list" && (
                <div className="placeholder-view">List View - Coming Soon!</div>
              )}
              {activeTab === "overview" && (
                <div className="placeholder-view">Overview - Coming Soon!</div>
              )}
            </>
          )}
        </main>
      </div>
    </DragDropContext>
  );
}

export default SprintPage;
