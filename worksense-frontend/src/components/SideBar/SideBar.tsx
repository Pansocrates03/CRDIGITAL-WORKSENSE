import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./SideBar.module.css";
import worksenseLogo from "@/assets/images/worksenseLogo.svg";
import { projectService } from "../../services/projectService";

interface ProjectNavItem {
  name: string;
  icon: string;
  path: string;
}

export const SideBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isProjectView = location.pathname.includes('/project/');
  const projectId = isProjectView ? location.pathname.split('/')[2] : null;
  const [projectName, setProjectName] = useState<string>("");

  useEffect(() => {
    const fetchProjectName = async () => {
      if (projectId) {
        try {
          const projectData = await projectService.getProject(projectId);
          setProjectName(projectData.name || "Untitled Project");
        } catch (error) {
          console.error("Error fetching project name:", error);
          setProjectName("Untitled Project");
        }
      }
    };

    fetchProjectName();
  }, [projectId]);

  const projectNavItems: ProjectNavItem[] = [
    { name: "Project Overview", icon: "/homeProject.svg", path: `/project/${projectId}/overview` },
    { name: "Backlog", icon: "/backlog.svg", path: `/project/${projectId}/backlog` },
    { name: "Sprint & Workflow", icon: "/sprint.svg", path: `/project/${projectId}/sprint` },
    { name: "User Management", icon: "/users.svg", path: `/project/${projectId}/users` },
    { name: "Story Management", icon: "/story.svg", path: `/project/${projectId}/stories` },
    { name: "Bug Tracking", icon: "/bug.svg", path: `/project/${projectId}/bugs` },
    { name: "Leaderboard", icon: "/leaderboard.svg", path: `/project/${projectId}/leaderboard` },
  ];

  const mainNavItems: ProjectNavItem[] = [
    { name: "My Projects", icon: "/bookOpen.svg", path: "/create" },
    { name: "Account", icon: "/Home.svg", path: "/account" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src={worksenseLogo} alt="WorkSense Logo" onClick={() => navigate('/create')} style={{ cursor: 'pointer' }} />
      </div>

      <nav>
        <ul>
          {isProjectView ? (
            // Project-specific navigation items
            <>
              {projectId && (
                <>
                  <div className={styles.projectHeader}>
                    <div className={styles.projectIcon}>
                      <img src="/project-icon.svg" alt="Project" />
                      <div>
                        <h3 className={styles.projectTitle}>{projectName} Project</h3>
                      </div>
                    </div>
                  </div>
                  <div className={styles.projectNav}>
                    {projectNavItems.map((item) => (
                      <li
                        key={item.name}
                        className={location.pathname === item.path ? styles.active : ''}
                        onClick={() => handleNavigation(item.path)}
                      >
                        <span className={styles.icon}>
                          <img src={item.icon} alt={item.name} />
                        </span>
                        {item.name}
                      </li>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            // Main navigation items
            mainNavItems.map((item) => (
              <li
                key={item.name}
                className={location.pathname === item.path ? styles.active : ''}
                onClick={() => handleNavigation(item.path)}
              >
                <span className={styles.icon}>
                  <img src={item.icon} alt={item.name} />
                </span>
                {item.name}
              </li>
            ))
          )}
        </ul>
      </nav>

      <div className={styles.documentation}>
        <h4>Documentation</h4>
        <ul>
          <li onClick={() => handleNavigation('/guides')}>
            <span className={styles.icon}>
              <img src="/guide.svg" alt="Guides" />
            </span>
            Guides
          </li>
          <li onClick={() => handleNavigation('/api')}>
            <span className={styles.icon}>
              <img src="/guide.svg" alt="API Reference" />
            </span>
            API Reference
          </li>
        </ul>
      </div>
    </aside>
  );
};
