// Core Imports
import React from 'react';
import { useState } from 'react';
import { useParams } from "react-router-dom";

// Views
import Tabs from './components/Tabs/Tabs';
import BoardView from './components/BoardView/BoardView';
import OverviewView from './components/OverviewView/OverviewView';
import TableView from './components/TableView/TableView';
import BurndownChartView from './components/BurndownChartView/BurndownChartView';

import DeleteConfirmationModal from '@/components/ui/deleteConfirmationModal/deleteConfirmationModal';

// Types
import { Sprint } from '@/types/SprintType';
import { IconType } from 'react-icons/lib';

import { createBurndownChartData } from './utils/CreateBurndownChartData';

import {
  FiLayout, FiGrid, FiBarChart // Icons for tab navigation
} from "react-icons/fi";
import { useTickets } from '@/hooks/useTickets';
import { useSprints } from '@/hooks/useSprints';
import { useStories } from '@/hooks/useStories';
import { Story } from '@/types/StoryType';
import { Ticket } from '@/types/TicketType';




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

function getTicketSprint(ticket: Ticket, stories: Story[]): string | undefined {
  const parentStory = stories.find(story => story.id === ticket.parentId);
  return parentStory?.sprintId;
}

const WorkflowPage: React.FC = () => {
    const { id: projectId } = useParams<{ id: string }>();

    // STATES
    const [activeTab, setActiveTab] = useState('sprints');
    //const [columns, setColumns] = useState(DEFAULT_COLUMNS);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null);

    // HOOKS
    const { data:stories=[], isLoading:isStoriesLoading, isError:isStoriesError } = useStories(projectId!)
    const { data:tickets=[], isLoading:isTicketsLoading, isError: isTicketsError, updateTicket } = useTickets(projectId!);
    const { data:sprints=[], isLoading: isSprintsLoading, error: isSprintsError, createSprint, updateSprint, deleteSprint } = useSprints(projectId!);

    // Error management
    if(isTicketsLoading || isSprintsLoading || isStoriesLoading){
      return <div>Loading...</div>
    }

    if(isTicketsError || isSprintsError || isStoriesError){
      return <div>An error has ocurred</div>
    }

    // Logic

    let activeSprint = sprints?.find(s => s.status.toLowerCase() == "active")
    if(!activeSprint) return <div>No sprints found</div>

    let filteredTickets = tickets.filter(ticket => getTicketSprint(ticket,stories) == activeSprint.id)

    if(activeSprint.columns.length <= 0){
      updateSprint(projectId!, {
        ...activeSprint,
        columns: ["In Progress", "In Review", "Done"]
      })
    }
    

    // FUNCTIONS
     // Handle Delete Sprint
  const handleDeleteSprint = (sprintId: string) => {
    if (projectId && sprintId) {
      deleteSprint(projectId,sprintId);
      setDeleteModalOpen(false); // Close the modal after deletion
    }
  };

  const handleCreateColumn = async (columnName: string) => {
    if (!activeSprint) return;
    
    const updatedColumns = [...activeSprint.columns, columnName];
    await updateSprint(projectId!, {
      ...activeSprint,
      columns: updatedColumns
    });
  };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };


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
                return <BoardView 
                  tickets={filteredTickets} 
                  onTicketUpdate={updateTicket} 
                  columns={activeSprint.columns || []} 
                />;
            case 'overview':
                return <OverviewView tasks={filteredTickets} />;
            case 'table':
                return <TableView tickets={filteredTickets} />;
            case 'burndown_chart':
                return <BurndownChartView data={burndown_chart_data} />
            default:
                return <BoardView 
                  tickets={filteredTickets} 
                  onTicketUpdate={updateTicket} 
                  columns={activeSprint.columns || []} 
                />;
        }
    };

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
        selectedSprintId={activeSprint.id}
        createSprint={createSprint}
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
