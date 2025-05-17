import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

// Import the Tabs component from SprintPage.tsx
import Tabs from '../Sprints/components/Tabs/Tabs';

const ProjectSettingsPage: React.FC = () => {
  const { id: projectId } = useParams<{ id:string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');

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
    <div>
        {/* Ttitle and Description Section */}
        <div className="flex items-baseline justify-between w-full">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                    Project Settings
                </h2>
                <p className="text-muted-foreground mt-1">
                    This section allows administrators and project managers to define and 
                    manage key project configurations, including foundational details, 
                    SCRUM-related parameters, customization elements, analytical tools, 
                    artificial intelligence enhancements, and access controls.
                </p>
            </div>
        </div>
        {/* Divider */}
        <div className="border-b border-border my-4"></div>

        {/* Tabs Navigation */}
        <Tabs
            items={navigationTabs}
            activeTabId={activeTab}
            onTabClick={handleTabChange}
        />

        {/* Content Area */}
        <div className="mt-6">
            {renderView()}
        </div>
    </div>
  );
};

export default ProjectSettingsPage;