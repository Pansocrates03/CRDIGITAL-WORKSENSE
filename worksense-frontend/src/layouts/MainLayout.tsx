// src/layouts/MainLayout.tsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { SideBar } from "../components/SideBar/SideBar"; // Adjust path
import { Header } from "../components/Header/Header"; // Adjust path
import { projectService } from "../services/projectService"; // Adjust path
import styles from "./MainLayout.module.css";

interface MainLayoutProps {
  children: React.ReactNode;
}

// Helper to get the current section name from the path
const getSectionFromPath = (pathname: string, projectId?: string): string => {
  if (!projectId) return ""; // Not in a project context

  const parts = pathname.split("/");
  const projectIndex = parts.indexOf(projectId);
  // Section name is usually the part after the projectId
  const section =
    projectIndex !== -1 && parts.length > projectIndex + 1
      ? parts[projectIndex + 1]
      : "overview"; // Default to 'overview' if no section specified

  // Capitalize first letter for display
  return section.charAt(0).toUpperCase() + section.slice(1);
};

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { id: projectId } = useParams<{ id?: string }>(); // Get project ID if available
  const location = useLocation();
  const navigate = useNavigate(); // Needed if fetching project fails perhaps
  const [projectName, setProjectName] = useState<string>("");
  const [projectLoading, setProjectLoading] = useState<boolean>(false);

  // Fetch project name when projectId changes
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (projectId) {
        setProjectLoading(true);
        try {
          const projectData = await projectService.fetchProjectDetails(projectId);
          // Use the actual project name for the header title within project context
          setProjectName(projectData.name || "Untitled Project");
        } catch (error) {
          console.error("Error fetching project name in Layout:", error);
          setProjectName("Error Loading Project");
          // Optional: Redirect if project fetch fails critically
          // navigate('/create', { replace: true });
        } finally {
          setProjectLoading(false);
        }
      } else {
        setProjectName(""); // Clear name if not in a project
      }
    };

    fetchProjectDetails();
  }, [projectId, navigate]); // Add navigate to dependency array if used in error handling

  // Determine Header props based on context
  const isInProjectView = !!projectId;
  const currentSection = getSectionFromPath(location.pathname, projectId);

  let headerTitle: string;

  if (isInProjectView) {
    // In project view, the Header's 'title' prop will be the project name
    // The breadcrumb will show ProjectName / SectionName
    headerTitle = projectLoading
      ? "Loading Project..."
      : projectName || "Project";
  } else if (location.pathname.startsWith("/create")) {
    headerTitle = "My Projects";
  } else if (location.pathname.startsWith("/account")) {
    headerTitle = "Account Settings";
  } else if (location.pathname.startsWith("/guides")) {
    headerTitle = "Guides";
  } else if (location.pathname.startsWith("/api")) {
    headerTitle = "API Reference";
  } else {
    headerTitle = "WorkSense"; // Default fallback
  }

  // Your Header logic seems to show breadcrumbs based on 'showBreadcrumb',
  // and the *last* part of the breadcrumb is hardcoded currently.
  // Let's adjust the 'title' passed to Header to be the *section name* when breadcrumbs are shown.
  // This requires modifying the Header component slightly.
  const titleForHeader = isInProjectView ? currentSection : headerTitle;
  const showBreadcrumb = isInProjectView; // Show breadcrumbs only inside a project
  const showBackButton = isInProjectView; // Show back button only inside a project

  // Loading UI component
  const LoadingUI = () => (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingIndicator}>
        <div className={styles.loadingDot}></div>
        <div className={styles.loadingDot}></div>
        <div className={styles.loadingDot}></div>
      </div>
      <span>Loading project details...</span>
    </div>
  );

  return (
    <div className={styles.layoutContainer}>
      {" "}
      {/* Flex row */}
      <SideBar />
      <div className={styles.mainPanel}>
        {" "}
        {/* Container for Header + Content */}
        <Header
          // Pass the calculated title (Section name in project, Page name otherwise)
          title={titleForHeader}
          // Pass the fetched project name specifically for breadcrumbs
          projectNameForBreadcrumb={isInProjectView ? projectName : undefined}
          showBackButton={showBackButton}
          showBreadcrumb={showBreadcrumb}
          projectId={projectId} // Pass projectId if available
        />
        {/* The main content area where page components render */}
        <main className={styles.contentArea}>
          {projectLoading && isInProjectView ? (
            <LoadingUI />
          ) : (
            children // Render page content once project name is loaded or not applicable
          )}
        </main>
      </div>
    </div>
  );
};
