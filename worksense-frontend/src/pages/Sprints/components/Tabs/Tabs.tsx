import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FiLayout, FiList, FiGrid, FiClock, FiCalendar } from "react-icons/fi";
import Modal from "@/components/Modal/Modal"; // Ajusta la ruta si es necesario
import { Input } from "@/components/ui/input";
import "./Tabs.css";

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  handleCreateColumn: (name:string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }> | null> = {
  sprints: FiCalendar,
  overview: null,
  board: FiLayout,
  list: FiList,
  table: FiGrid,
  timeline: FiClock,
};

const Tabs: React.FC<TabsProps> = ({ items, activeTabId, onTabClick, handleCreateColumn }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewColumnName("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewColumnName(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateColumn(newColumnName); // Llama a la función del padre
    handleCloseModal();
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
          <Button onClick={() => setIsModalOpen(true)}>
            + Columna
          </Button>
        )}        
      </nav>


      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="sm"
        title="Nueva columna" >

        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Nombre de la columna"
            value={newColumnName}
            onChange={handleInputChange}
            autoFocus
            required
          />
          <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
            <Button type="button" onClick={handleCloseModal} variant="secondary">
              Cancelar
            </Button>
            <Button type="submit">Crear</Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Tabs;