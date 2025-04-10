// src/pages/CreateProject/CreateProject.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CreateProject.module.css";

import { NewProjectModal } from "../../components/NewProjectModal/NewProjectModal";
import { Alert } from "../../components/Alert/Alert";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "@/api/apiClient";
import {
  projectService,
  Project as ProjectType,
} from "../../services/projectService";

// API base URL
const API_BASE_URL = "http://localhost:5050";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "WIP" | "DONE" | "CANCELLED";
  lastChange: string;
}

type SortOption = "last-change" | "status" | "a-z" | "z-a";

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>("last-change");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const projectsData = await projectService.getAllProjects();
      console.log("Response data:", projectsData); // Debug log

      // Check if projectsData is an array
      if (!Array.isArray(projectsData)) {
        console.error("Response data is not an array:", projectsData);
        return;
      }

      const formattedProjects: Project[] = projectsData.map((project: any) => ({
        id: project.id || project._id || String(Date.now()),
        name: project.name || "Unnamed Project",
        description: project.description || "No description",
        status: "WIP" as const,
        lastChange: new Date()
          .toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          .toLowerCase(),
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();

    // First filter by search term
    let filtered = projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchTermLower) ||
        project.description.toLowerCase().includes(searchTermLower)
    );

    // Then sort based on current sort option
    return filtered.sort((a, b) => {
      switch (currentSort) {
        case "last-change":
          return (
            new Date(b.lastChange).getTime() - new Date(a.lastChange).getTime()
          );
        case "status":
          const statusOrder = { WIP: 1, DONE: 2, CANCELLED: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        case "a-z":
          return a.name.localeCompare(b.name);
        case "z-a":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [projects, searchTerm, currentSort]);

  const handleCreateProject = async (
    projectName: string,
    description: string,
    members: { userId: number; roleId: string }[]
  ) => {
    try {
      const response = await projectService.createProject({
        name: projectName,
        description: description,
      });

      console.log("Create project response:", response);

      // If there are additional members to add (beyond the current user who's automatically added)
      if (members.length > 0) {
        const addMemberPromises = members.map((member) =>
          projectService.addProjectMember(
            response.id,
            member.userId,
            member.roleId
          )
        );

        await Promise.all(addMemberPromises);
      }

      const newProject: Project = {
        id: response.id || String(Date.now()),
        name: projectName,
        description: description,
        status: "WIP",
        lastChange: new Date()
          .toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          .toLowerCase(),
      };

      setProjects([...projects, newProject]);
      setIsModalOpen(false);
      setAlert({
        type: "success",
        title: "Project Created Successfully!",
        message: `Your project "${projectName}" has been created and is ready to use.`,
      });
    } catch (error) {
      console.error("Error creating project:", error);
      setAlert({
        type: "error",
        title: "Something went wrong...",
        message: "Please try again!",
      });
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleFilterSelect = (option: SortOption) => {
    setCurrentSort(option);
    setIsFilterOpen(false);
  };

  // Close filter dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const filterButton = document.querySelector(`.${styles.filterButton}`);
      const filterDropdown = document.querySelector(
        `.${styles.filterDropdown}`
      );

      if (
        filterButton &&
        filterDropdown &&
        !filterButton.contains(event.target as Node) &&
        !filterDropdown.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add handleProjectClick function
  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <main className={styles.mainContent}>
      <section className={styles.projectsSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.welcomeMessage}>
            <h2 className={styles.welcomeTitle}>
              {loading
                ? "Cargando..."
                : `Bienvenido, ${
                    user?.fullName ||
                    (user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.firstName ||
                        user?.email?.split("@")[0] ||
                        "Usuario")
                  }!`}
            </h2>
            <p className={styles.welcomeText}>
              Manage your projects and organize your work efficiently.
            </p>
          </div>

          <div className={styles.compactControls}>
            <div className={styles.searchContainer}>
              <input
                className={styles.searchInput}
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className={styles.clearSearch}
                  onClick={handleClearSearch}
                >
                  ✕
                </button>
              )}
            </div>

            <div className={styles.actionButtons}>
              <div className={styles.filterContainer}>
                <button
                  className={`${styles.filterButton} ${
                    isFilterOpen ? styles.active : ""
                  }`}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  title="Filter"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="10" y1="17" x2="14" y2="17" />
                  </svg>
                </button>
                {isFilterOpen && (
                  <div className={styles.filterDropdown}>
                    <button
                      className={`${styles.filterOption} ${
                        currentSort === "last-change" ? styles.active : ""
                      }`}
                      onClick={() => handleFilterSelect("last-change")}
                    >
                      Last Change
                    </button>
                    <button
                      className={`${styles.filterOption} ${
                        currentSort === "status" ? styles.active : ""
                      }`}
                      onClick={() => handleFilterSelect("status")}
                    >
                      Status
                    </button>
                    <button
                      className={`${styles.filterOption} ${
                        currentSort === "a-z" ? styles.active : ""
                      }`}
                      onClick={() => handleFilterSelect("a-z")}
                    >
                      A-Z
                    </button>
                    <button
                      className={`${styles.filterOption} ${
                        currentSort === "z-a" ? styles.active : ""
                      }`}
                      onClick={() => handleFilterSelect("z-a")}
                    >
                      Z-A
                    </button>
                  </div>
                )}
              </div>

              <button
                className={styles.newProjectButton}
                onClick={() => setIsModalOpen(true)}
              >
                <span className={styles.btnIcon}>+</span>
                New Project
              </button>
            </div>
          </div>
        </div>

        <div className={styles.projectCards}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner} />
              <div className={styles.loadingText}>Loading projects...</div>
            </div>
          ) : (
            <>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={styles.card}
                    onClick={() => handleProjectClick(project.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.cardHeader}>
                      <h4>{project.name}</h4>
                      <span className={styles.cardArrow}>&#8250;</span>
                    </div>
                    <p className={styles.projectInfo}>{project.description}</p>
                    <span
                      className={`${styles.status} ${
                        styles[project.status.toLowerCase()]
                      }`}
                    >
                      {project.status}
                    </span>
                    <div className={styles.cardFooter}>
                      <span className={styles.lastChange}>
                        Last change: {project.lastChange}
                      </span>
                    </div>
                  </div>
                ))
              ) : searchTerm ? (
                <div className={styles.noResults}>
                  No projects found matching "{searchTerm}"
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <h4 className={styles.emptyStateTitle}>No projects yet</h4>
                  <p className={styles.emptyStateText}>
                    Create your first project to start organizing your work and
                    collaborating with your team.
                  </p>
                  <button
                    className={styles.createFirstButton}
                    onClick={() => setIsModalOpen(true)}
                  >
                    Create your first project
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />

      {alert && (
        <Alert
          type={alert.type}
          title={
            alert.type === "success"
              ? "Project Created Successfully!"
              : "Something went wrong..."
          }
          message={
            alert.type === "success"
              ? `Your project "${
                  alert.message.split('"')[1] || "name"
                }" has been created and is ready to use.`
              : "Please try again!"
          }
          onClose={() => setAlert(null)}
          actionLabel={alert.type === "error" ? "Try again" : undefined}
          onAction={
            alert.type === "error" ? () => setIsModalOpen(true) : undefined
          }
        />
      )}
    </main>
  );
};

export default CreateProject;
