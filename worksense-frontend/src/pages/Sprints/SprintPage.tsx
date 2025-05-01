// src/pages/Sprints/SprintPage.tsx

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

// Import custom hooks for fetching data
import { useRelevantSprints } from "../../hooks/useSprintData"; // Adjust path if needed
import { useSprintTasks } from "../../hooks/useTaskData"; // Adjust path if needed

// Import types
import { Sprint, ApiResponseTask } from "../../types/SprintType"; // Adjust path if needed

// Import components
import TaskBoard from "./components/TaskBoard/TaskBoard";
import PageHeader from "./components/PageHeader/PageHeader"; // Use the updated PageHeader

// Import STYLES
import "./SprintPage.css"; // Main page styles (ensure it has correct padding)
// Child component CSS should be imported within those components themselves
// e.g., TaskBoard imports TaskBoard.css, TaskColumn imports TaskColumn.css etc.

// Define the possible status columns for tasks (Using PascalCase from your example)
type ColumnStatus = "ToDo" | "InProgress" | "Review" | "Done";
const STATUS_COLUMNS: ColumnStatus[] = ["ToDo", "InProgress", "Review", "Done"];

// Helper function to find the most relevant sprint to display
function findDefaultSprint(sprints: Sprint[]): Sprint | null {
  if (!sprints?.length) return null;
  const activeSprint = sprints.find((s) => s.status === "Active");
  if (activeSprint) return activeSprint;
  const now = new Date();
  const upcomingSprint = sprints
    .filter(
      (s) =>
        s.status === "Planned" &&
        s.endDate &&
        new Date(s.endDate).getTime() >= now.getTime()
    )
    .sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : Infinity;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : Infinity;
      return dateA - dateB;
    })[0];
  if (upcomingSprint) return upcomingSprint;
  return (
    sprints.sort((a, b) => {
      const dateA = a.endDate ? new Date(a.endDate).getTime() : 0;
      const dateB = b.endDate ? new Date(b.endDate).getTime() : 0;
      return dateB - dateA;
    })[0] ?? null
  );
}

// Define the column interface for TaskBoard
interface Column {
  id: ColumnStatus | "_Other";
  title: string;
  tasks: ApiResponseTask[];
}

// Helper function to create a user-friendly title from a status ID
const formatColumnTitle = (status: ColumnStatus | "_Other"): string => {
  if (status === "_Other") return "Other";
  // Simple formatter for PascalCase statuses like "InProgress" -> "In Progress"
  return status.replace(/([A-Z])/g, " $1").trim();
};

// --- Main Sprint Page Component ---
function SprintPage() {
  // Get project ID from URL
  const { id: projectId } = useParams<{ id: string }>();

  // State for selected sprint ID and active tab
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("board"); // Keep for PageHeader prop

  // --- Data Fetching ---
  const {
    data: sprints = [],
    isLoading: isLoadingSprints,
    isError: isSprintsError,
    error: sprintsError,
  } = useRelevantSprints(projectId); // Assuming hook handles undefined projectId

  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    isError: isTasksError,
    error: tasksError,
  } = useSprintTasks(projectId, selectedSprintId ?? undefined); // Enabled only when sprint selected

  // --- Effects ---
  // Effect to select a default sprint once sprints load successfully
  useEffect(() => {
    if (
      !isLoadingSprints &&
      !isSprintsError &&
      sprints.length > 0 &&
      !selectedSprintId
    ) {
      const defaultSprint = findDefaultSprint(sprints);
      if (defaultSprint) {
        setSelectedSprintId(defaultSprint.id);
      }
    }
  }, [sprints, isLoadingSprints, isSprintsError, selectedSprintId]); // Dependencies

  // --- Memoized Data Transformation for TaskBoard ---
  const boardData = useMemo(() => {
    if (!selectedSprintId || isLoadingTasks) {
      return STATUS_COLUMNS.map((status) => ({
        id: status,
        title: formatColumnTitle(status), // Use formatted title
        tasks: [],
      }));
    }

    const columnsMap = new Map<ColumnStatus | "_Other", ApiResponseTask[]>();
    STATUS_COLUMNS.forEach((status) => columnsMap.set(status, []));

    tasks.forEach((task) => {
      const taskStatusLower = task.status?.toLowerCase();
      let assignedColumnKey: ColumnStatus | "_Other" | null = null;
      for (const standardStatus of STATUS_COLUMNS) {
        if (taskStatusLower === standardStatus.toLowerCase()) {
          assignedColumnKey = standardStatus;
          break;
        }
      }
      if (!assignedColumnKey) {
        assignedColumnKey = "_Other";
        if (!columnsMap.has("_Other")) {
          columnsMap.set("_Other", []);
        }
      }
      columnsMap.get(assignedColumnKey)?.push(task);
    });

    const finalColumns: Column[] = [];
    STATUS_COLUMNS.forEach((status) => {
      finalColumns.push({
        id: status,
        title: formatColumnTitle(status),
        tasks: (columnsMap.get(status) || []).sort(
          (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)
        ),
      });
    });

    if (columnsMap.has("_Other") && columnsMap.get("_Other")!.length > 0) {
      finalColumns.push({
        id: "_Other",
        title: formatColumnTitle("_Other"),
        tasks: (columnsMap.get("_Other") || []).sort(
          (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)
        ),
      });
    }
    return finalColumns;
  }, [tasks, selectedSprintId, isLoadingTasks]); // Dependencies

  // --- Event Handlers ---
  // Renamed handler for selecting from the custom dropdown in PageHeader
  const handleSprintSelect = (sprintId: string | null) => {
    setSelectedSprintId(sprintId);
  };

  // Handler for tab changes (if tabs are used)
  const handleTabChange = (tabId: string) => setActiveTab(tabId);

  // --- Helper data for rendering ---
  // Find the full sprint object for the selected ID (used for PageHeader title/description)
  const selectedSprint = useMemo(() => {
    return sprints.find((s) => s.id === selectedSprintId);
  }, [sprints, selectedSprintId]);

  // --- Render Logic ---
  return (
    // Ensure .sprint-page class in SprintPage.css has correct padding for alignment
    <div className="sprint-page">
      {/* Use the updated PageHeader, passing sprint data and the new handler */}
      <PageHeader
        // Determine title based on selection and loading state
        title={
          isLoadingSprints
            ? "Loading..."
            : selectedSprint
            ? selectedSprint.name
            : sprints.length > 0
            ? "Select Sprint" // Prompt if sprints exist but none selected
            : "No Sprints Available" // Message if no sprints loaded
        }
        description={selectedSprint?.goal ?? ""} // Show goal only if a sprint is selected
        teamMembers={[]} // Placeholder
        tabItems={[{ id: "board", label: "Board" }]} // Simplified tabs
        activeTabId={activeTab}
        onTabChange={handleTabChange}
        // --- Pass sprint props down ---
        sprints={sprints}
        selectedSprintId={selectedSprintId}
        onSprintSelect={handleSprintSelect} // Pass the updated handler
        isLoadingSprints={isLoadingSprints}
        isSprintsError={isSprintsError}
        // sprintsError={sprintsError} // Pass error if PageHeader needs to display it
        // --- End pass sprint props ---
      />

      {/* --- Old Sprint Selector block is removed --- */}

      {/* Main Content Area - Task Board */}
      <div className="task-board-area">
        {/* Specific Loading/Error/Empty states for the TASK BOARD */}

        {/* 1. Show loading message only when a sprint IS selected AND tasks ARE loading */}
        {selectedSprintId && isLoadingTasks && (
          <div style={{ padding: "40px", textAlign: "center" }}>
            Loading tasks...
          </div>
        )}

        {/* 2. Show error message only when a sprint IS selected AND tasks ARE NOT loading AND there IS a task error */}
        {selectedSprintId && !isLoadingTasks && isTasksError && (
          <div style={{ padding: "40px", textAlign: "center", color: "red" }}>
            Error loading tasks: {tasksError?.message ?? "Unknown error"}
          </div>
        )}

        {/* 3. Show 'Select Sprint' prompt only if NO sprint is selected AND sprints ARE NOT loading/errored AND sprints EXIST */}
        {!selectedSprintId &&
          !isLoadingSprints &&
          !isSprintsError &&
          sprints.length > 0 && (
            <div style={{ padding: "40px", textAlign: "center" }}>
              Please select a sprint using the dropdown in the header.
            </div>
          )}

        {/* 4. Handle case where sprints loaded okay, but there are none */}
        {!isLoadingSprints &&
          !isSprintsError &&
          sprints.length === 0 &&
          !selectedSprintId && (
            <div style={{ padding: "40px", textAlign: "center" }}>
              No sprints found for this project. Create one to get started.
            </div>
          )}

        {/* 5. Render the TaskBoard component *only* when:
               - A sprint IS selected
               - Tasks ARE NOT loading
               - There was NO error loading tasks
          */}
        {selectedSprintId && !isLoadingTasks && !isTasksError && (
          <TaskBoard columns={boardData} />
        )}

        {/* 6. Optional: Add message if tasks loaded successfully but the list is empty for that sprint */}
        {selectedSprintId &&
          !isLoadingTasks &&
          !isTasksError &&
          tasks.length === 0 && (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              This sprint currently has no tasks.
            </div>
          )}
      </div>
    </div>
  );
}

export default SprintPage;
