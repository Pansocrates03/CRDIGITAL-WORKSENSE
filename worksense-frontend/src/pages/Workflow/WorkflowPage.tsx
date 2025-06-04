// Core Imports
import React from 'react';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from "react-router-dom";
import QueryKeys from '@/utils/QueryKeys';
import { projectService } from '@/services/projectService';
import { useDeleteSprint, useSprints } from '@/hooks/useSprintData';

import { useBacklogItemUpdate } from '@/hooks/useBacklogItemUpdate';
import { format } from 'date-fns';

// Views
import Tabs from './components/Tabs/Tabs';
import BoardView from './components/BoardView/BoardView';
import OverviewView from './components/OverviewView/OverviewView';
import TableView from './components/TableView/TableView';
import BurndownChartView from './components/BurndownChartView/BurndownChartView';

import DeleteConfirmationModal from '@/components/ui/deleteConfirmationModal/deleteConfirmationModal';
import CreateItemModal from '@/components/BacklogTable/CreateItemModal';
import UpdateItemModal from '@/components/BacklogTable/UpdateItemModal';
import { toast } from 'sonner';

// Types
import BacklogItemType from "@/types/BacklogItemType.ts";
import { Sprint } from '@/types/SprintType';
import { IconType } from 'react-icons/lib';
import ProjectDetails from '@/types/ProjectType';

import { createBurndownChartData } from './utils/CreateBurndownChartData';

import {
  FiLayout, FiGrid, FiBarChart // Icons for tab navigation
} from "react-icons/fi";

// Add type for story point scale
type StoryPointScale = "fibonacci" | "linear" | "tshirt";

const DEFAULT_COLUMNS = [
  { id: 'sprint_backlog', title: 'Sprint Backlog' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'done', title: 'Done' }
];

export interface TabItem {
  id: string;
  label: string;
  icon: IconType|null
}
const navigationTabs: TabItem[] = [
  { id: "overview", label: "Overview", icon: null },
  { id: "board", label: "Board", icon:FiLayout },
  { id: "table", label: "Table", icon:FiGrid },
  { id: "burndown_chart", label: "Charts", icon:FiBarChart}
]

// Helper to convert Firestore timestamp or string/Date to JS Date
function toDate(val: any): Date | undefined {
    if (!val) return undefined;
    if (typeof val === 'object' && (val.seconds || val._seconds)) {
        // Firestore timestamp
        const seconds = val.seconds ?? val._seconds;
        return new Date(seconds * 1000);
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
}

const WorkflowPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { id: projectId } = useParams<{ id: string }>();

    // HOOKS
    const { isLoading, data, error } = useQuery<BacklogItemType[], Error>({
        queryKey: [QueryKeys.backlog, projectId],
        queryFn: () => projectService.fetchProjectItems(projectId ? projectId : "")
    })
    const { mutate: deleteSprintMutation } = useDeleteSprint(projectId ?? "");
    const updateBacklogItemMutation = useBacklogItemUpdate();

    // Fetch sprints data using custom hook
    const { data: sprints, isLoading: sprintsLoading, error: sprintsError } = useSprints(projectId ?? "");
    
    const { data: project } = useQuery<ProjectDetails>({
        queryKey: ["project", projectId],
        queryFn: () => projectService.fetchProjectDetails(projectId!),
        enabled: !!projectId,
    });
    
    // STATES
    const [tasks, setTasks] = useState<BacklogItemType[]>([]);
    const [activeTab, setActiveTab] = useState('board');
    const [columns, setColumns] = useState(DEFAULT_COLUMNS);
    const [selectedSprint, setSelectedSprint] = useState<string>('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<BacklogItemType | null>(null);

    // Obtener función refetch del useQuery de backlog
    const { refetch } = useQuery<BacklogItemType[], Error>({
        queryKey: [QueryKeys.backlog, projectId],
        queryFn: () => projectService.fetchProjectItems(projectId ? projectId : "")
    });

    // Update columns when project.workflowStages changes
    React.useEffect(() => {
        if (project && Array.isArray(project.workflowStages) && project.workflowStages.length > 0) {
            setColumns(project.workflowStages.map(stage => ({
                id: stage,
                title: stage
            })));
        } else {
            setColumns(DEFAULT_COLUMNS);
        }
    }, [project?.workflowStages]);

    // get active sprint
    if(!sprints && !sprintsLoading) {
      return <div>No sprints found</div>
    }
    let activeSprint = sprints?.find(s => s.status == "Active")
    if(!activeSprint){
      return <div>No sprints found</div>
    }

    let filteredStories = data?.filter(item => {
      console.log("Item", item.name, "has sprint", item.sprint, "and we are looking for", activeSprint.id)
      return item.sprint == activeSprint.id
    })
    

    // FUNCTIONS
     // Handle Delete Sprint
  const handleDeleteSprint = (sprintId: string) => {
    if (sprintId) {
      deleteSprintMutation(sprintId); // Call mutation to delete the sprint
      setDeleteModalOpen(false); // Close the modal after deletion
    }
  };

    const handleCreateColumn = (columnName: string) => {
    const newColumn = {
        id: columnName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(), // Create a unique id, for example using Date.now()
        title: columnName
        };
        setColumns(prev => [...prev, newColumn]);
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
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
    if (data && activeSprint) {
      console.log("DATA", data);
      // Flatten all subitems
      let flattenedData = data.flatMap(getItemChildren);

      // Filter out EPIC items and only include items from active sprint
      let filteredData = flattenedData.filter(item => 
        item.type !== "epic" && item.sprint === activeSprint.id
      );

      // Set tasks state
      setTasks(filteredData);
    } else {
      // If no active sprint, set empty tasks array
      setTasks([]);
    }
  }, [data, activeSprint]);
    const handleTaskUpdate = async (
        taskId: string,
        newStatus: BacklogItemType["status"]
    ) => {
        // Optimistic update for UI
        setTasks(prevTasks =>
            prevTasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task )
        );

        let task = tasks.find(t => t.id === taskId);
        if (!task) throw new Error("Task not found");

        // Si es subitem (tiene parentId), actualizar usando la ruta de subitems
        if (task.parentId) {
            try {
                await projectService.updateBacklogItem(
                    projectId || "",
                    {
                        ...task,
                        status: newStatus
                    },
                    task.parentId // pasar parentId para que el service use la ruta correcta
                );
                // Opcional: invalidar queries si es necesario
                queryClient.invalidateQueries({ queryKey: [QueryKeys.backlog, projectId] });
            } catch (err) {
                console.error("Error updating subitem status:", err);
            }
        } else {
            // Use the new mutation hook para items normales
            updateBacklogItemMutation.mutate({
                projectId: projectId ? projectId : "",
                itemId: taskId,
                itemType: task.type || "story", // fallback a "story" si no hay tipo
                updateData: { status: newStatus }
            });
        }
    };

    const onTaskContentUpdate = async (
      backlogItemId: string,
      newTasks: {name: string, isFinished: boolean}[]
    ) => {
      setTasks(prevItems => 
        prevItems.map(item => item.id === backlogItemId ? { ...item, tasks: newTasks } : item)
      )
      let task = tasks.find(t => t.id === backlogItemId);
      if(!task) throw new Error("Task not found"); // Error handling
      task.tasks = newTasks;
      await projectService.updateBacklogItem(projectId ? projectId : "", task)

      queryClient.invalidateQueries({ queryKey: [QueryKeys.backlog, projectId] });
    }

    // Get active sprint's start and end dates
    const sprintStart = activeSprint ? toDate(activeSprint.startDate) : undefined;
    const sprintEnd = activeSprint ? toDate(activeSprint.endDate) : undefined;

    // Ensure storyPointScale is one of the allowed values
    const projectScale = project?.storyPointScale;
    const storyPointScale: StoryPointScale = 
        (projectScale === 'fibonacci' || projectScale === 'linear' || projectScale === 'tshirt')
            ? projectScale
            : 'tshirt';

    // Generate burndown chart data from tasks and sprint range
    const burndownChartData = React.useMemo(() => {
        if (!sprintStart || !sprintEnd) return [];
        return createBurndownChartData(tasks, sprintStart, sprintEnd, storyPointScale);
    }, [tasks, sprintStart, sprintEnd, storyPointScale]);

    // Prepare heatmap data: count of 'Done' items per day (use all items in data, not just tasks)
    const doneItemsPerDay = React.useMemo(() => {
        if (!data) return [];
        const counts: Record<string, number> = {};
        // Aplana todos los items y subitems
        const allItems = data.flatMap(getItemChildren);
        allItems.forEach(item => {
            let updatedAt = item.updatedAt;
            if (typeof updatedAt === 'object' && updatedAt !== null) {
                if ('seconds' in updatedAt && typeof (updatedAt as any).seconds === 'number') {
                    updatedAt = new Date((updatedAt as any).seconds * 1000).toISOString();
                } else if ('_seconds' in updatedAt && typeof (updatedAt as any)._seconds === 'number') {
                    updatedAt = new Date((updatedAt as any)._seconds * 1000).toISOString();
                }
            }
            if (item.status === 'Done' && updatedAt) {
                const dateObj = new Date(updatedAt);
                if (!isNaN(dateObj.getTime())) {
                    const date = format(dateObj, 'yyyy-MM-dd');
                    counts[date] = (counts[date] || 0) + 1;
                }
            }
        });
        return Object.entries(counts).map(([date, count]) => ({ date, count }));
    }, [data]);

    const handleSuccess = (title: string, message: string) => {
      toast.success(title + (message ? `: ${message}` : ''));
    };

    const handleError = (error: any) => {
      toast.error(typeof error === 'string' ? error : (error?.message || 'An error occurred'));
    };

    if (error) { throw new Error("An error has occurred on SprintPage.tsx"); }
    if (isLoading) { return <div>Loading...</div> }
    if (!data) { throw new Error("Nothing received") }

    console.log('Raw backlog data from backend:', data);
    console.log('Tasks state in WorkflowPage:', tasks);

    const renderView = () => {
        switch (activeTab) {
            case 'board':
                return <BoardView tasks={tasks} onTaskUpdate={handleTaskUpdate} columns={columns} onTaskContentUpdate={onTaskContentUpdate} />;
            case 'overview':
                return <OverviewView tasks={tasks} />;
            case 'table':
                return <TableView tasks={tasks} />;
            case 'burndown_chart':
                if (!sprintStart || !sprintEnd) {
                    return <div>No sprint date range available.</div>;
                }
                return <BurndownChartView 
                    data={burndownChartData} 
                    doneItemsPerDay={doneItemsPerDay} 
                    tasks={tasks}
                    sprintStart={sprintStart}
                    sprintEnd={sprintEnd}
                    storyPointScale={storyPointScale}
                />;
            default:
                return <BoardView tasks={tasks} onTaskUpdate={handleTaskUpdate} columns={columns} onTaskContentUpdate={onTaskContentUpdate} />;
        }
    };

    return (
    <div className="sprint-page" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0 }}>
      <div className="sprint-page__header">
        <div className="sprint-page__header-content">
          <h1 className="sprint-page__title">Workflow ({activeSprint.name})</h1>
          <p className="sprint-page__description">Sprint board for tracking project tasks and progress</p>
        </div>
      </div>

      {/* Tabs Component */}
      <Tabs
        TabItems={navigationTabs}
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

      {projectId && (
        <CreateItemModal
            projectId={projectId}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onItemCreated={() => {
                handleSuccess("Item  created successfully!",
                    "You should now see the item in the backlog.");
                refetch();
            }}
            onError={handleError}
            storyPointScale={project?.storyPointScale || 'tshirt'}
            statusOptions={project?.workflowStages || ["To Do", "In Progress", "Done"]}
        />
      )}

      {projectId && (
        <UpdateItemModal
            projectId={projectId}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onItemUpdated={() => {
                handleSuccess(`The ${itemToEdit?.type} ${itemToEdit?.name} was updated successfully!`, "You should now see the updated item in the backlog.");
                refetch();
            }}
            onError={handleError}
            item={itemToEdit}
            storyPointScale={project?.storyPointScale || 'tshirt'}
            statusOptions={project?.workflowStages || ["To Do", "In Progress", "Done"]}
        />
      )}
    </div>
  );
};

export default WorkflowPage;
