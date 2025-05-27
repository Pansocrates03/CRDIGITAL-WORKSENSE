// Core Imports
import React from 'react';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from "react-router-dom";
import QueryKeys from '@/utils/QueryKeys';
import { projectService } from '@/services/projectService';

// Views
import Tabs from './components/Tabs/Tabs';
import BoardView from './components/BoardView/BoardView';
import OverviewView from './components/OverviewView/OverviewView';
import TableView from './components/TableView/TableView';
import BurndownChartView from './components/BurndownChartView/BurndownChartView';

import DeleteConfirmationModal from '@/components/ui/deleteConfirmationModal/deleteConfirmationModal';

// Types
import BacklogItemType from "@/types/BacklogItemType.ts";
import { Sprint } from '@/types/SprintType';
import { IconType } from 'react-icons/lib';

import { createBurndownChartData } from './utils/CreateBurndownChartData';

import {
  FiLayout, FiGrid, FiClock, FiBarChart // Icons for tab navigation
} from "react-icons/fi";


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
  { id: "burndown_chart", label: "Burndown Chart", icon:FiBarChart}
]

const WorkflowPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { id: projectId } = useParams<{ id: string }>();

    // HOOKS
    const { isLoading, data, error } = useQuery<BacklogItemType[], Error>({
        queryKey: [QueryKeys.backlog, projectId],
        queryFn: () => projectService.fetchProjectItems(projectId ? projectId : "")
    })
    const { mutate: deleteSprintMutation } = useDeleteSprint(projectId ?? "");
    
    // Fetch sprints data using custom hook
    const { data: sprints, isLoading: sprintsLoading, error: sprintsError } = useSprints(projectId ?? "");
    
    // STATES
    const [tasks, setTasks] = useState<BacklogItemType[]>([]);
    const [activeTab, setActiveTab] = useState('sprints');
    const [columns, setColumns] = useState(DEFAULT_COLUMNS);
    const [selectedSprint, setSelectedSprint] = useState<string>('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null);

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
    if (filteredStories) {
      console.log("Filtered Stories", filteredStories);
      // Flatten all subitems
      let flattenedData = filteredStories.flatMap(getItemChildren);

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
            prevTasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task )
        );
        let task = tasks.find(t => t.id === taskId); // Find task
        if(!task) throw new Error("Task not found"); // Error handling
        task.status = newStatus
        await projectService.updateBacklogItem(projectId ? projectId : "", task); // Wait for update

        // Invalidate Query Client
        queryClient.invalidateQueries({ queryKey: [QueryKeys.backlog, projectId] });
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

    const burndown_chart_data = [
      { date: '2024-03-01', remainingWork: 100, idealBurndown: 100 },
      { date: '2024-03-02', remainingWork: 80, idealBurndown: 80 },
      { date: '2024-03-03', remainingWork: 65, idealBurndown: 60 },
      { date: '2024-03-04', remainingWork: 50, idealBurndown: 40 },
      { date: '2024-03-05', remainingWork: 30, idealBurndown: 20 },
      { date: '2024-03-06', remainingWork: 10, idealBurndown: 0 },
    ];
    // use instead:
    // const brundown_chart_data = createBurndownChartData(tasks)

    const renderView = () => {
        switch (activeTab) {
            case 'board':
                return <BoardView tasks={tasks} onTaskUpdate={handleTaskUpdate} columns={columns} onTaskContentUpdate={onTaskContentUpdate} />;
            case 'overview':
                return <OverviewView tasks={tasks} />;
            case 'table':
                return <TableView tasks={tasks} />;
            case 'burndown_chart':
                return <BurndownChartView data={burndown_chart_data} />
            default:
                return <BoardView tasks={tasks} onTaskUpdate={handleTaskUpdate} columns={columns} onTaskContentUpdate={onTaskContentUpdate} />;
        }
    };

    if (error) { throw new Error("An error has occurred on SprintPage.tsx"); }
    if (isLoading) { return <div>Loading...</div> }
    if (!data) { throw new Error("Nothing received") }

    return (
    <div className="sprint-page">
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
    </div>
  );
};

export default WorkflowPage;
