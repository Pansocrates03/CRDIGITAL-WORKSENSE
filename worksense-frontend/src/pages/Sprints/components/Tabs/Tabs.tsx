import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FiLayout, FiList, FiGrid, FiClock, FiCalendar } from "react-icons/fi";
import Modal from "@/components/Modal/Modal";
import { Input } from "@/components/ui/input";
import "./Tabs.css";

// Use hooks
import { useCreateSprint } from "@/hooks/useSprintData";

// Import Types
import { Sprint } from '@/types/SprintType'

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  handleCreateColumn: (name: string) => void;
  projectId: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }> | null> = {
  sprints: FiCalendar,
  overview: null,
  board: FiLayout,
  list: FiList,
  table: FiGrid,
  timeline: FiClock,
};

const Tabs: React.FC<TabsProps> = ({ items, activeTabId, onTabClick, handleCreateColumn, projectId }) => {
  const createSprintMutation = useCreateSprint(projectId);

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const handleCloseColumnModal = () => {
    setIsColumnModalOpen(false);
    setNewColumnName("");
  };

  const handleColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateColumn(newColumnName);
    handleCloseColumnModal();
  };


  // CREATE SPRINT MODAL CONTROLLERS
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false);
  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const formatDate = (date: string | Date) =>
  new Date(date).toISOString().split("T")[0];

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    const sprintData: Omit<Sprint, "id" | "projectId" | "createdAt" | "updatedAt"> = {
      name: sprintName,
      goal: sprintGoal,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      status: "Planned",
    };
    
    try{
      await createSprintMutation.mutateAsync(sprintData);
      setIsCreateSprintModalOpen(false);
      setSprintName("");
      setSprintGoal("");
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error("Sprint creation error:", error);
    }
  };

  return (
    <>
      <nav className="tabs-navigation tabs-navigation--with-action">
        <div className="tabs-navigation__items">
          {items.map((item) => {
            const IconComponent = iconMap[item.id];
            const isActive = item.id === activeTabId;
            return (
              <button
                key={item.id}
                className={`tabs-navigation__item ${
                  isActive ? "tabs-navigation__item--active" : ""
                }`}
                onClick={() => onTabClick(item.id)}
                aria-current={isActive ? "page" : undefined}
              >
                {IconComponent && (
                  <IconComponent className="tabs-navigation__icon" size={16} />
                )}
                <span className="tabs-navigation__label">{item.label}</span>
              </button>
            );
          })}
        </div>

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

      {/* Column Modal */}
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

      {/* Create Sprint Modal */}
      <Modal
        isOpen={isCreateSprintModalOpen}
        onClose={() => {
          setIsCreateSprintModalOpen(false);
          // Reset modal info
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
