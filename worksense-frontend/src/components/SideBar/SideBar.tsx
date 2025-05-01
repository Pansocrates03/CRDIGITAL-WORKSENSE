import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./SideBar.module.css";
import worksenseLogo from "@/assets/images/worksenseLogo.svg";
import settingsIcon from "@/assets/images/settings.svg";
import { projectService } from "../../services/projectService";
import { Alert } from "../Alert/Alert";

// Define nav item interface
interface NavItem {
  name: string;
  icon: string;
  path: string;
  badge?: number | string;
}

// Component for rendering individual nav items
const NavItemComponent: React.FC<{
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => (
  <li
    className={`${styles.navItem} ${isActive ? styles.active : ""}`}
    onClick={onClick}
    title={item.name}
  >
    <span className={styles.icon}>
      <img src={item.icon} alt="" aria-hidden="true" />
    </span>
    <span className={styles.navText}>{item.name}</span>
    {item.badge !== undefined && (
      <span className={styles.badge}>{item.badge}</span>
    )}
  </li>
);

export const SideBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // Extract project ID from URL using useMemo for performance
  const { isProjectView, projectId } = useMemo(() => {
    const isInProjectView = location.pathname.includes("/project/");
    const id = isInProjectView ? location.pathname.split("/")[2] : null;
    return { isProjectView: isInProjectView, projectId: id };
  }, [location.pathname]);

  // Fetch project name when project ID changes
  useEffect(() => {
    let isMounted = true;
    const fetchProjectName = async () => {
      if (!projectId) return;

      setIsLoading(true);
      setError(null);

      try {
        const projectData = await projectService.fetchProjectDetails(projectId);
        if (isMounted) {
          setProjectName(projectData.name || "Untitled Project");
        }
      } catch (error) {
        console.error("Error fetching project name:", error);
        if (isMounted) {
          setError("Failed to load project data");
          setProjectName("Untitled Project");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProjectName();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Improved active state check that works with nested routes
  const isPathActive = (path: string): boolean => {
    // For exact match
    if (location.pathname === path) return true;

    if (path !== "/" && location.pathname.startsWith(path + "/")) return true;

    return false;
  };

  // Define project navigation items with useMemo
  const projectNavItems = useMemo<NavItem[]>(
    () => [
      {
        name: "Project Overview",
        icon: "/homeProject.svg",
        path: `/project/${projectId}/overview`,
      },
      {
        name: "Backlog",
        icon: "/backlogPage.svg",
        path: `/project/${projectId}/product-backlog`,
      },
      {
        name: "Sprint & Workflow",
        icon: "/sprint.svg",
        path: `/project/${projectId}/sprint`,
      },
      {
        name: "User Management",
        icon: "/users.svg",
        path: `/project/${projectId}/users`,
      },
      // {
      //   name: "Story Management",
      //   icon: "/story.svg",
      //   path: `/project/${projectId}/stories`,
      // },
      // {
      //   name: "Bug Tracking",
      //   icon: "/bug.svg",
      //   path: `/project/${projectId}/bugs`,
      //   badge: 3, // Example of a badge showing number of bugs
      // },
      // {
      //   name: "Leaderboard",
      //   icon: "/leaderboard.svg",
      //   path: `/project/${projectId}/leaderboard`,
      // },
    ],
    [projectId]
  );

  // Define main navigation items
  const mainNavItems = useMemo<NavItem[]>(
    () => [
      { name: "My Projects", icon: "/bookOpen.svg", path: "/create" },
      { name: "Settings", icon: settingsIcon, path: "/settings" },
    ],
    []
  );

  // Navigation handler
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Loading UI component
  const LoadingUI = () => (
    <div className={styles.projectLoading}>
      <div className={styles.loadingIndicator}>
        <div className={styles.loadingDot}></div>
        <div className={styles.loadingDot}></div>
        <div className={styles.loadingDot}></div>
      </div>
      <span>Loading project...</span>
    </div>
  );

  return (
    <aside className={styles.sidebar}>
      <div
        className={styles.logo}
        onClick={() => navigate("/create")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            navigate("/create");
          }
        }}
      >
        <img src={worksenseLogo} alt="WorkSense" />
      </div>

      {isProjectView && (
        <div className={styles.projectHeader}>
          {isLoading ? (
            <LoadingUI />
          ) : (
            <div className={styles.projectInfo}>
              <div className={styles.projectIcon}>
                <span>{projectName.charAt(0).toUpperCase()}</span>
              </div>
              <h3 className={styles.projectTitle} title={projectName}>
                {projectName}
              </h3>
              {error && <div className={styles.errorMessage}>{error}</div>}
            </div>
          )}
        </div>
      )}

      <nav className={styles.navigation} aria-label="Main Navigation">
        {isProjectView ? (
          <>
            <div className={styles.sectionTitle} id="project-nav-title">
              Project Navigation
            </div>
            <ul className={styles.navList} aria-labelledby="project-nav-title">
              {projectNavItems.map((item) => (
                <NavItemComponent
                  key={item.path}
                  item={item}
                  isActive={isPathActive(item.path)}
                  onClick={() => handleNavigation(item.path)}
                />
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className={styles.sectionTitle} id="main-nav-title">
              Main Navigation
            </div>
            <ul className={styles.navList} aria-labelledby="main-nav-title">
              {mainNavItems.map((item) => (
                <NavItemComponent
                  key={item.path}
                  item={item}
                  isActive={isPathActive(item.path)}
                  onClick={() => handleNavigation(item.path)}
                />
              ))}
            </ul>
          </>
        )}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.versionInfo}>WorkSense v1.2.0</div>
        <button
          className={styles.helpButton}
          onClick={() => setShowAlert(true)}
        >
          Need Help?
        </button>
      </div>
      {showAlert && (
        <Alert
          type="success"
          title="¡No se necesita ayuda!"
          message="WorkSense está diseñado para ser intuitivo y fácil de usar."
          onClose={() => setShowAlert(false)}
        />
      )}
    </aside>
  );
};

export default SideBar;
