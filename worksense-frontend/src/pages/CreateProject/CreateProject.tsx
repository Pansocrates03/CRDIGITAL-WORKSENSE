// src/pages/CreateProject/CreateProject.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CreateProject.module.css";
import { useEffect, useMemo, useState } from "react";

import NewProjectModal from "../../components/NewProjectModal/NewProjectModal";
import { Alert } from "../../components/Alert/Alert";
import { useAuth } from "../../contexts/AuthContext";
import { projectService } from "../../services/projectService";
import ProjectDetails from "../../types/ProjectType";
import { useUserProjects } from "@/hooks/useUserProjects";

// Icons
import {
  Calendar,
  ArrowRight,
  Search,
  X,
  SlidersHorizontal,
  Plus,
} from "lucide-react";



type SortOption = "last-change" | "status" | "a-z" | "z-a" | "progress";

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoading, setLoading ] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>("last-change");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [projectCreated, setProjectCreated] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);


  // NEW ENDPOINT DATA RETRIEVER
  const { getUserProjects } = useUserProjects()
  const [ projects, setProjects ] = useState<ProjectDetails[] | null>(null);
console.log("lol")
  useEffect(() => {
    
    async function loadUserProjects() {
      setLoading(true)
      //setError(null)

      try {
        const projectsData = await getUserProjects();
        console.log("PDATA",projectsData);
        setProjects(projectsData)
      } catch (err) {
        // setError('Error al cargar los miembros');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadUserProjects()
  }, [getUserProjects])

  console.log("lol")


  


  // Filter and sort projects
  const filteredProjects = projects;
  if(!filteredProjects ) throw Error("Filtered projects is null")
  /*
  const filteredProjects = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();
    if(!projects) throw Error("No projects found");

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
          const statusOrder = {
            Active: 1,
            "On Hold": 2,
            Inactive: 3,
            Completed: 4,
          };
          return (
            statusOrder[a.status as keyof typeof statusOrder] -
            statusOrder[b.status as keyof typeof statusOrder]
          );

        case "a-z":
          return a.name.localeCompare(b.name);
        case "z-a":
          return b.name.localeCompare(a.name);

        case "progress":
          const getProgress = (project: ProjectDetails) => {
            if (project.items.length === 0) return 0;
            return (
              (project.items.filter(
                (item) => item.status === "COMPLETED" || item.status === "DONE"
              ).length /
                project.items.length) *
              100
            );
          };
          return getProgress(b) - getProgress(a);

        default:
          return 0;
      }
    });
  }, [projects, searchTerm, currentSort]);
  */

  /*
  const handleCreateProject = async (
    projectName: string,
    description: string,
    members: { userId: number; roleId: string }[],
    shouldPopulateBacklog: boolean
  ): Promise<string> => {
    try {
      const response = await projectService.createProject({
        name: projectName,
        description: description,
      });

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
        status: "Active",
        lastChange: new Date()
          .toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          .toLowerCase(),
        members: [],
        items: [],
      };

      setProjects([...projects, newProject]);

      // Set projectCreated to true to indicate a project was created
      setProjectCreated(true);

      // Return the project ID first, let the modal handle its closure
      return response.id;
    } catch (error) {
      console.error("Error creating project:", error);
      setAlert({
        type: "error",
        title: "Something went wrong...",
        message: "Please try again!",
      });
      throw error;
    }
  };
  */

  const handleModalClose = () => {
    setIsModalOpen(false);

    // Only show success message if a project was actually created
    if (projectCreated) {
      setAlert({
        type: "success",
        title: "Project Created Successfully!",
        message: `Your project has been created and is ready to use.`,
      });
      // Reset the projectCreated state
      setProjectCreated(false);
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

  // Get status color class based on status
  const getStatusColorClass = (status: string): string => {
    switch (status) {
      case "Active":
        return styles.statusActive;
      case "Inactive":
        return styles.statusInactive;
      case "Completed":
        return styles.statusCompleted;
      case "On Hold":
        return styles.statusOnHold;
      default:
        return styles.statusActive;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <main className={styles.mainContent}>
      <section className={styles.projectsSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.welcomeMessage}>
            <h2 className={styles.welcomeTitle}>
              {loading
                ? "Loading..."
                : `Welcome, ${
                    user?.fullName ||
                    (user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.firstName || user?.email?.split("@")[0] || "User")
                  }!`}
            </h2>
            <p className={styles.welcomeText}>
              Manage your agile projects and organize your sprints efficiently.
            </p>
          </div>

          <div className={styles.compactControls}>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} size={18} />
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
                  <X size={16} />
                </button>
              )}
            </div>

            <div className={styles.actionButtons}>
              <div className={styles.viewToggle}>
                <button
                  className={`${styles.viewToggleButton} ${
                    viewMode === "grid" ? styles.active : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <rect x="1" y="1" width="6" height="6" rx="1" />
                    <rect x="9" y="1" width="6" height="6" rx="1" />
                    <rect x="1" y="9" width="6" height="6" rx="1" />
                    <rect x="9" y="9" width="6" height="6" rx="1" />
                  </svg>
                </button>
                <button
                  className={`${styles.viewToggleButton} ${
                    viewMode === "list" ? styles.active : ""
                  }`}
                  onClick={() => setViewMode("list")}
                  title="List View"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <rect x="1" y="1" width="14" height="3" rx="1" />
                    <rect x="1" y="6" width="14" height="3" rx="1" />
                    <rect x="1" y="11" width="14" height="3" rx="1" />
                  </svg>
                </button>
              </div>

              <div className={styles.filterContainer}>
                <button
                  className={`${styles.filterButton} ${
                    isFilterOpen ? styles.active : ""
                  }`}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  title="Sort Projects"
                >
                  <SlidersHorizontal size={18} />
                </button>
                {isFilterOpen && (
                  <div className={styles.filterDropdown}>
                    <button
                      className={`${styles.filterOption} ${
                        currentSort === "last-change" ? styles.active : ""
                      }`}
                      onClick={() => handleFilterSelect("last-change")}
                    >
                      Last Updated
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
                        currentSort === "progress" ? styles.active : ""
                      }`}
                      onClick={() => handleFilterSelect("progress")}
                    >
                      Progress
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
                <Plus size={18} />
                New Project
              </button>
            </div>
          </div>
        </div>

        <div
          className={`${styles.projectCards} ${
            viewMode === "list" ? styles.listView : ""
          }`}
        >
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
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitleArea}>
                        <div className={styles.titleRow}>
                          <h4>{project.name}</h4>
                          <div
                            className={`${styles.status} ${getStatusColorClass(
                              "DONE"
                              //project.status
                            )}`}
                          >
                            DONE
                            {/* project.status */}
                          </div>
                        </div>
                        <p className={styles.projectInfo}>
                          {project.description}
                        </p>
                      </div>
                    </div>

                    <div className={styles.progressContainer}>
                      <div className={styles.progressBar}>
                        {/*
                        <div
                          className={styles.progressFill}
                          style={{
                            width: `${
                              project.items.length > 0
                                ? (project.items.filter(
                                    (item) =>
                                      item.status === "COMPLETED" ||
                                      item.status === "DONE"
                                  ).length /
                                    project.items.length) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                        */}
                      </div>
                      {/* 
                      <span className={styles.progressText}>
                        {project.items.length > 0
                          ? Math.round(
                              (project.items.filter(
                                (item) =>
                                  item.status === "COMPLETED" ||
                                  item.status === "DONE"
                              ).length /
                                project.items.length) *
                                100
                            )
                          : 0}
                        % Complete
                      </span>
                      */}
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.metaInfo}>
                        <div className={styles.memberAvatars}>
                          {/*
                          {project.members.slice(0, 3).map((member) => (
                            <div
                              key={member.id}
                              className={styles.memberAvatar}
                              title={member.name}
                            >
                              {member.avatar ? (
                                <img src={member.avatar} alt={member.name} />
                              ) : (
                                <div className={styles.avatarInitials}>
                                  {getInitials(member.name || "Unknown")}
                                </div>
                              )}
                            </div>
                          ))}
                          {project.members.length > 3 && (
                            <div className={styles.moreMembers}>
                              +{project.members.length - 3}
                            </div>
                          )}
                            */}
                        </div>
                        <div className={styles.metaItem}>
                          <Calendar size={16} className={styles.metaIcon} />
                          <span>{/* project.lastChange */}</span>
                        </div>
                      </div>
                      <div className={styles.cardAction}>
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                ))
              ) : searchTerm ? (
                <div className={styles.noResults}>
                  <div className={styles.noResultsIcon}>🔍</div>
                  <h3>No projects found matching "{searchTerm}"</h3>
                  <p>Try a different search term or clear filters</p>
                  <button
                    className={styles.clearSearchButton}
                    onClick={handleClearSearch}
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>📋</div>
                  <h4 className={styles.emptyStateTitle}>No projects yet</h4>
                  <p className={styles.emptyStateText}>
                    Create your first project to start organizing your sprints
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

{/*
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleCreateProject}
        currentUserId={user?.userId ?? -1}
      />
*/}

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
  );
};

export default CreateProject;
