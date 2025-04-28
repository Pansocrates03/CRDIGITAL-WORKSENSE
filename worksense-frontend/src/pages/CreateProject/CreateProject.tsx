// src/pages/CreateProject/CreateProject.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CreateProject.module.css";

import NewProjectModal from "../../components/NewProjectModal/NewProjectModal";
import { Alert } from "../../components/Alert/Alert";
import { useAuth } from "../../contexts/AuthContext";
import { projectService } from "../../services/projectService";
import SectionHeader from "./SectionHeader";
import { Project } from "../../types/ProjectType";
import ProjectDetails from "../../types/ProjectType";
import ProjectCard from "./ProjectCard";

// Icons
import { Calendar, ArrowRight } from "lucide-react";
import NoProjectsAvailable from "./NoProjectsAvailable";



type SortOption = "last-change" | "status" | "a-z" | "z-a" | "progress";

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>("last-change");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [projectCreated, setProjectCreated] = useState(false);

  if(!user) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const projectsData = await projectService.getAllProjects();

      if (!Array.isArray(projectsData)) {
        console.error("Response data is not an array:", projectsData);
        return;
      }

      const formattedProjects: Project[] = await Promise.all(
        projectsData.map(async (project: any) => {
          // Get project members
          const members = await projectService.getProjectMembers(project.id);
          const formattedMembers = members.map((member: any) => {
            // Generate a light random color
            const getRandomLightColor = () => {
              // Using higher values (180-255) for RGB components to ensure lighter colors
              const r = Math.floor(180 + Math.random() * 75)
                .toString(16)
                .padStart(2, "0");
              const g = Math.floor(180 + Math.random() * 75)
                .toString(16)
                .padStart(2, "0");
              const b = Math.floor(180 + Math.random() * 75)
                .toString(16)
                .padStart(2, "0");
              return `${r}${g}${b}`;
            };

            return {
              id: member.userId,
              name: member.name || "Unknown User",
              avatar:
                member.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  member.name || "Unknown"
                )}&background=${getRandomLightColor()}&color=000000`,
            };
          });

          // Calculate task counts
          const items = project.items || [];
          const taskCounts = {
            todo: items.filter(
              (item: any) => item.status === "TODO" || item.status === "BACKLOG"
            ).length,
            inProgress: items.filter(
              (item: any) => item.status === "IN_PROGRESS"
            ).length,
            completed: items.filter(
              (item: any) =>
                item.status === "COMPLETED" || item.status === "DONE"
            ).length,
          };

          return {
            id: project.id || project._id || String(Date.now()),
            name: project.name || "Unnamed Project",
            description: project.description || "No description",
            status: project.status || "Active",
            lastChange: new Date()
              .toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
              .toLowerCase(),
            members: formattedMembers,
            items: items,
          };
        })
      );

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
          const getProgress = (project: Project) => {
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



  return (
    <main className={styles.mainContent}>
      <section className={styles.projectsSection}>

        {/* Header Section */}
        <SectionHeader
          loading={loading}
          user={user}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleClearSearch={handleClearSearch}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          currentSort={currentSort}
          handleFilterSelect={handleFilterSelect}
          setIsModalOpen={setIsModalOpen}
        />


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
                  /* Render each project card */
                  <ProjectCard
                    key={project.id}
                    project={project}
                    handleProjectClick={() => handleProjectClick(project.id)}
                  />
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
                <NoProjectsAvailable setIsModalOpen={setIsModalOpen}/>
              )}
            </>
          )}
        </div>
      </section>

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleCreateProject}
        currentUserId={user?.userId ?? -1}
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
  );
};

export default CreateProject;