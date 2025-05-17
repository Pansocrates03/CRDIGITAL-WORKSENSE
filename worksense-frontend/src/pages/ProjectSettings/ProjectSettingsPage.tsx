import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import '../Sprints/components/styles/SprintPage.css';

// Import the Tabs component from SprintPage.tsx
import Tabs from '../Sprints/components/Tabs/Tabs';

const ProjectSettingsPage: React.FC = () => {
  const { id: projectId } = useParams<{ id:string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('generalInfo');

  // Define the navigation tabs
  const navigationTabs = [
    { id: "generalInfo", label: "General Info" },
    { id: "scrumSettings", label: "Scrum Settings" },
    { id: "customization", label: "Customization" },
    { id: "analytics", label: "Metrics & Analytics" },
    { id: "aiSettings", label: "AI Settings" },
    { id: "security", label: "Security & Access" },
  ];

  const handleTabChange = (tabId: string) => { 
    setActiveTab(tabId);
  };

  const renderView = () => {
    switch (activeTab) {
        case 'generalInfo':
            return <div>General Info View</div>;
        case 'scrumSettings':
            return <div>Scrum Settings View</div>;
        case 'customization':
            return <div>Customization View</div>;
        case 'analytics':
            return <div>Analytics View</div>;
        case 'aiSettings':
            return <div>AI Settings View</div>;
        case 'security':
            return <div>Security & Access View</div>;
        default:
            return <div>General Info View</div>;
    }
  };

  return (
    <div className="sprint-page">
      <div className="sprint-page__header">
        <div className="sprint-page__header-content">
          <h1 className="sprint-page__title">Project Settings</h1>
          <p className="sprint-page__description">
            This section allows administrators and project managers to define and 
            manage key project configurations, including foundational details, 
            SCRUM-related parameters, customization elements, analytical tools, 
            artificial intelligence enhancements, and access controls.
          </p>
        </div>
      </div>
      <div className="border-b border-border my-4"></div>
      <Tabs
        items={navigationTabs}
        activeTabId={activeTab}
        onTabClick={handleTabChange}
      />
      <div className="mt-6">
        {renderView()}
      </div>
    </div>
  );
};

export default ProjectSettingsPage;