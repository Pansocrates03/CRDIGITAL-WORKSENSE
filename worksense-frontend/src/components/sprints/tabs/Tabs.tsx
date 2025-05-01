// src/components/Tabs.jsx
import React from "react";
import { FiLayout, FiList, FiGrid, FiClock } from "react-icons/fi"; // Example icons
import "./Tabs.css"; // Create this CSS file

// Map tab IDs to icons (customize as needed)
const iconMap = {
  overview: null, // No icon for overview in example
  board: FiLayout,
  list: FiList,
  table: FiGrid,
  timeline: FiClock,
};

function Tabs({ items = [], activeTabId, onTabClick }) {
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
}

export default Tabs;
