// src/pages/CreateProject/CreateProject.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CreateProject.module.css";
import { SideBar } from "../../components/SideBar/SideBar";
import { Header } from "../../components/Header/Header";
import { NewProjectModal } from "../../components/NewProjectModal/NewProjectModal";
import { Alert } from "../../components/Alert/Alert";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "@/api/apiClient";

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
  const { user } = useAuth();
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
      // Simulate loading delay of 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await apiClient.get(`${API_BASE_URL}/projects`);
      console.log("Response data:", response.data); // Debug log

      // Check if response.data is an array
      if (!Array.isArray(response.data)) {
        console.error("Response data is not an array:", response.data);
        return;
      }

      const projectsData: Project[] = response.data.map((project: any) => ({
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

      setProjects(projectsData);
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
    description: string
  ) => {
    try {
      const response = await apiClient.post(`${API_BASE_URL}/projects`, {
        name: projectName,
        description: description,
      });

      console.log("Create project response:", response.data);

      const newProject: Project = {
        id: response.data.id || response.data._id || String(Date.now()),
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
    <div className={styles.pageContainer}>
      <SideBar />
      <main className={styles.mainContent}>
        <Header title="Projects" />
        <section className={styles.projectsSection}>
          <div className={styles.projectsHeader}>
            <button
              className={styles.newProjectButton}
              onClick={() => setIsModalOpen(true)}
            >
              New Project
            </button>
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
            <div className={styles.filterContainer}>
              <button
                className={`${styles.filterButton} ${
                  isFilterOpen ? styles.active : ""
                }`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <img src="/Filter Button.svg" alt="Filter" />
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
          </div>

          <h3>{user?.username || "My"} projects</h3>
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
                      <p className={styles.projectInfo}>
                        {project.description}
                      </p>
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
                      Create your first project to start organizing your work
                      and collaborating with your team.
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
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
            actionLabel={alert.type === "error" ? "Try again" : undefined}
            onAction={
              alert.type === "error" ? () => setIsModalOpen(true) : undefined
            }
          />
        )}
      </main>
    </div>
  );
};

export default CreateProject;
