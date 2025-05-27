// src/layouts/MainLayout.tsx
import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { SideBar } from "../components/SideBar/SideBar";
import { Header } from "../components/Header/Header";
import styles from "./MainLayout.module.css";
import FridaChat from "@/components/FridaChat/FridaChat";
import { FridaChatProvider } from "@/contexts/FridaChatPositionContext";
import { useProject } from "@/hooks/useProjects";

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

  const { data: projectData, isLoading: projectLoading } = useProject(projectId ?? "");


  const isInProjectView = !!projectId;
  const currentSection = getSectionFromPath(location.pathname, projectId);

  let headerTitle: string;
  let showSidebar = true;

  switch (true) {
    case isInProjectView:
      headerTitle = projectLoading
        ? "Loading Project..."
        : projectData?.name || "Project";
      break;
    case location.pathname.startsWith("/create"):
      headerTitle = "LOGO";
      showSidebar = false;
      break;
    case location.pathname.startsWith("/settings"):
      headerTitle = "Settings";
      showSidebar = false;
      break;
    case location.pathname.startsWith("/account"):
      headerTitle = "Account Settings";
      break;
    case location.pathname.startsWith("/guides"):
      headerTitle = "Guides";
      break;
    case location.pathname.startsWith("/api"):
      headerTitle = "API Reference";
      break;
    default:
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
            projectNameForBreadcrumb={isInProjectView ? projectData?.name : undefined}
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
