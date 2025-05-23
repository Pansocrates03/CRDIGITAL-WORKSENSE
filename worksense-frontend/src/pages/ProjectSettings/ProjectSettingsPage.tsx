import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation,useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { useAuth } from "@/hooks/useAuth";

import '../Sprints/components/styles/SprintPage.css';

// Import components for tabs
import GeneralInfoView from './components/GeneralInfoView';
import AISettingsView from './components/AISettingsView';
import MetricsAnalyticsView from "./components/MetricsAnalyticsView";

// Import the Tabs component from SprintPage.tsx
import Tabs from '../Sprints/components/Tabs/Tabs';
import ScrumSettingsView from "./components/ScrumSettingsView";
import CustomizationView from "./components/CustomizationView";

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
  ];

  const handleTabChange = (tabId: string) => { 
    setActiveTab(tabId);
  };

  const renderView = () => {
    switch (activeTab) {
        case 'generalInfo':
            return <GeneralInfoView />;
        case 'scrumSettings':
            return <ScrumSettingsView />;
        case 'customization':
            return <CustomizationView />;
        case 'analytics':
            return <MetricsAnalyticsView/>;
        case 'aiSettings':
            return <AISettingsView />;
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
            This section allows administrators and product owners to define and 
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