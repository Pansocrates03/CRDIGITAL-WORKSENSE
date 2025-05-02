// src/components/Tabs.jsx
import React from "react";
import { FiLayout, FiList, FiGrid, FiClock } from "react-icons/fi"; // Example icons
import "./Tabs.css"; // Create this CSS file

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  activeTabId: string;
  onTabClick: (id: string) => void;
}

// Map tab IDs to icons
const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }> | null> = {
  overview: null, // No icon for overview
  board: FiLayout,
  list: FiList,
  table: FiGrid,
  timeline: FiClock,
};

const Tabs: React.FC<TabsProps> = ({ items, activeTabId, onTabClick }) => {
  return (
    <nav className="tabs-navigation">
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
            aria-current={isActive ? "page" : undefined} // Accessibility
          >
            {IconComponent && (
              <IconComponent className="tabs-navigation__icon" size={16} />
            )}
            <span className="tabs-navigation__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Tabs;
