// src/layouts/MainLayout.tsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { SideBar } from "../components/SideBar/SideBar";
import { Header } from "../components/Header/Header";
import { projectService } from "../services/projectService";
import styles from "./MainLayout.module.css";
import FridaChat from "@/components/FridaChat/FridaChat";
import { FridaChatProvider } from "@/contexts/FridaChatPositionContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

const getSectionFromPath = (pathname: string, projectId?: string): string => {
  if (!projectId) return "";
  const parts = pathname.split("/");
  const projectIndex = parts.indexOf(projectId);
  const section =
    projectIndex !== -1 && parts.length > projectIndex + 1
      ? parts[projectIndex + 1]
      : "overview";
  return section.charAt(0).toUpperCase() + section.slice(1);
};

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { id: projectId } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState<string>("");
  const [projectLoading, setProjectLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (projectId) {
        setProjectLoading(true);
        try {
          const projectData = await projectService.fetchProjectDetails(
            projectId
          );
          setProjectName(projectData.name || "Untitled Project");
        } catch (error) {
          console.error("Error fetching project name in Layout:", error);
          setProjectName("Error Loading Project");
        } finally {
          setProjectLoading(false);
        }
      } else {
        setProjectName("");
      }
    };
    fetchProjectDetails();
  }, [projectId, navigate]);

  const isInProjectView = !!projectId;
  const currentSection = getSectionFromPath(location.pathname, projectId);

  let headerTitle: string;
  let showSidebar = true;

  if (isInProjectView) {
    headerTitle = projectLoading
      ? "Loading Project..."
      : projectName || "Project";
  } else if (location.pathname.startsWith("/create")) {
    headerTitle = "LOGO";
    showSidebar = false;
  } else if (location.pathname.startsWith("/settings")) {
    headerTitle = "Settings";
    showSidebar = false;
  } else if (location.pathname.startsWith("/account")) {
    headerTitle = "Account Settings";
  } else if (location.pathname.startsWith("/guides")) {
    headerTitle = "Guides";
  } else if (location.pathname.startsWith("/api")) {
    headerTitle = "API Reference";
  } else {
    headerTitle = "WorkSense";
  }

  const titleForHeader = isInProjectView ? currentSection : headerTitle;
  const showBreadcrumb = isInProjectView;
  const showBackButton =
    isInProjectView || location.pathname.startsWith("/settings");

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
    <FridaChatProvider>
      <div className={styles.layoutContainer}>
        <SideBar showSidebar={showSidebar} />
        <div className={styles.mainPanel}>
          <Header
            title={titleForHeader}
            projectNameForBreadcrumb={isInProjectView ? projectName : undefined}
            showBackButton={showBackButton}
            showBreadcrumb={showBreadcrumb}
            projectId={projectId}
          />
          <main className={styles.contentArea}>
            {projectLoading && isInProjectView ? <LoadingUI /> : children}
          </main>
          <FridaChat projectId={projectId} />
        </div>
      </div>
    </FridaChatProvider>
  );
};

export default MainLayout;
