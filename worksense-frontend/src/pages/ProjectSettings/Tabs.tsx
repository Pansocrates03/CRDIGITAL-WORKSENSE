import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Reusable UI button component
import {
  FiLayout, FiList, FiGrid, FiClock, FiCalendar // Icons for tab navigation
} from "react-icons/fi";
import Modal from "@/components/Modal/Modal"; // Generic modal component
import { Input } from "@/components/ui/input"; // Reusable input component
import "./Tabs.css";

// Hook to create new sprint

// Sprint type definition
import { Sprint } from '@/types/SprintType';
import TabItem from "./components/TabItemType";

// Props expected by this Tabs component
interface TabsProps {
  items: TabItem[]; // Array of navigation tabs (board, sprints, overview, etc.)
  activeTabId: string; // Currently selected tab
  onTabClick: (id: string) => void; // Callback to switch tabs
  handleCreateColumn: (name: string) => void; // Callback to add column in board
  projectId: string; // Project identifier
  selectedSprintId?: string; // ID of the currently selected sprint
}

/**
 * Maps tab IDs to their corresponding icon components
 * Used to display appropriate icons in the tab navigation
 */
const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }> | null> = {
  sprints: FiCalendar,
  overview: null,
  board: FiLayout,
  list: FiList,
  table: FiGrid,
  timeline: FiClock,
};

/**
 * Tabs component for sprint management navigation
 * Handles tab switching, sprint creation, and column management
 */
const Tabs: React.FC<TabsProps> = ({ items, activeTabId, onTabClick, handleCreateColumn, projectId, selectedSprintId }) => {

  // --- State for column creation modal ---
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  // Close modal and reset column input
  const handleCloseColumnModal = () => {
    setIsColumnModalOpen(false);
    setNewColumnName("");
  };

  // Handle new column form submit
  const handleColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateColumn(newColumnName); // Notify parent to create column
    handleCloseColumnModal(); // Close modal after creation
  };

  // --- State for create sprint modal ---
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false);
  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Formats a date string to YYYY-MM-DD format for API compatibility
  const formatDate = (date: string | Date) =>
    new Date(date).toISOString().split("T")[0];

  // Handles the creation of a new sprint
  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();

    // Data to send to backend
    const sprintData: Omit<Sprint, "id" | "projectId" | "createdAt" | "updatedAt"> = {
      name: sprintName,
      goal: sprintGoal,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      status: "Planned", // Default status
    };
    
    try {
      //await createSprintMutation.mutateAsync(sprintData); // Call backend
      // Reset modal and fields
      setIsCreateSprintModalOpen(false);
      setSprintName("");
      setSprintGoal("");
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error("Sprint creation error:", error); // Log error if any
    }
  };

  /**
   * Filters tabs based on sprint selection
   * Shows all tabs that don't require a sprint
   * Shows sprint-dependent tabs only when a sprint is selected
   */
  const visibleTabs = items.filter(item => 
    !item.requiresSprint || (item.requiresSprint && selectedSprintId)
  );

  return (
    <>
      {/* Tabs Navigation Bar */}
      <nav className="tabs-navigation tabs-navigation--with-action">
        <div className="tabs-navigation__items">
          {visibleTabs.map((item) => {
            const IconComponent = iconMap[item.id]; // Get icon for the tab
            const isActive = item.id === activeTabId; // Highlight if active
            const isDisabled = item.requiresSprint && !selectedSprintId;
            return (
              <button
                key={item.id}
                className={`tabs-navigation__item ${
                  isActive ? "tabs-navigation__item--active" : ""
                } ${isDisabled ? "tabs-navigation__item--disabled" : ""}`}
                onClick={() => !isDisabled && onTabClick(item.id)} // Switch tab
                aria-current={isActive ? "page" : undefined}
                disabled={isDisabled}
                title={isDisabled ? "Select a sprint first" : undefined}
              >
                {/* Icon + Label */}
                {IconComponent && (
                  <IconComponent className="tabs-navigation__icon" size={16} />
                )}
                <span className="tabs-navigation__label">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons for Specific Tabs */}
        {activeTabId === "board" && (
          <Button onClick={() => setIsColumnModalOpen(true)}>
            + Columna
          </Button>
        )}

        {activeTabId === "sprints" && (
          <Button onClick={() => setIsCreateSprintModalOpen(true)}>
            + Sprint
          </Button>
        )}
      </nav>

      {/* --- Column Modal --- */}
      <Modal
        isOpen={isColumnModalOpen}
        onClose={handleCloseColumnModal}
        size="sm"
        title="Nueva columna"
      >
        <form onSubmit={handleColumnSubmit}>
          <Input
            type="text"
            placeholder="Nombre de la columna"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            autoFocus
            required
          />
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
            <Button type="button" onClick={handleCloseColumnModal} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">Crear</Button>
          </div>
        </form>
      </Modal>

      {/* --- Sprint Creation Modal --- */}
      <Modal
        isOpen={isCreateSprintModalOpen}
        onClose={() => {
          setIsCreateSprintModalOpen(false);
          // Reset all fields when closing
          setSprintName("");
          setSprintGoal("");
          setStartDate("");
          setEndDate("");
        }}
        size="sm"
        title="Nuevo Sprint"
      >
        <form onSubmit={handleCreateSprint}>
          <Input
            type="text"
            placeholder="New Sprint"
            value={sprintName}
            onChange={(e) => setSprintName(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Sprint Goal"
            value={sprintGoal}
            onChange={(e) => setSprintGoal(e.target.value)}
            style={{ marginTop: "0.75rem" }}
          />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ marginTop: "0.75rem" }}
            required
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ marginTop: "0.75rem" }}
            required
          />
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
            <Button type="button" onClick={() => setIsCreateSprintModalOpen(false)} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">Create Sprint</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Tabs;