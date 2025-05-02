// src/pages/CreateProject/CreateProject.tsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CreateProject.module.css";

import NewProjectModal from "../../components/NewProjectModal/NewProjectModal";
import { Alert } from "../../components/Alert/Alert";
import { useAuth } from "../../contexts/AuthContext";
import { projectService } from "../../services/projectService";
import SectionHeader from "./SectionHeader";
import ProjectCard from "./ProjectCard";

// Icons
import NoProjectsAvailable from "./NoProjectsAvailable";
import { useQuery } from "@tanstack/react-query";

type SortOption =  "a-z" | "z-a";


const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>("a-z");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);
  const [projectCreated, setProjectCreated] = useState(false);

  // Use Query to fetch user projects
  const { isLoading, data, isError, error, isSuccess } = useQuery({
    queryKey: ['userProjects'],
    queryFn: async () => {
      const res = await projectService.fetchUserProjects();
      return res;
    }
  });

  // IMPORTANTE: definir filteredProjects aquí, antes de cualquier retorno condicional
  const filteredProjects = useMemo(() => {
    // Si no hay datos, devolver array vacío
    if (!data) return [];
    
    const searchTermLower = searchTerm.toLowerCase();

    // First filter by search term
    let filtered = data.filter(
      (project) =>
        project.name.toLowerCase().includes(searchTermLower) ||
        project.description.toLowerCase().includes(searchTermLower)
    );

    // Then sort based on current sort option
    return filtered.sort((a, b) => {
      switch (currentSort) {
        case "a-z":
          return a.name.localeCompare(b.name);
        case "z-a":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [data, searchTerm, currentSort]);

  const handleModalClose = () => {
    setIsModalOpen(false);

    if (projectCreated) {
      setAlert({
        type: "success",
        title: "Project Created Successfully!",
        message: `Your project has been created and is ready to use.`,
      });
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

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  // Renderizado condicional dentro del return en lugar de retornos tempranos
  if (isLoading || loading || !user) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

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

        <div className={styles.divider} />

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
          ) : isError ? (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3>Error loading projects</h3>
              <p>{error instanceof Error ? error.message : "An unknown error occurred"}</p>
            </div>
          ) : (
            <>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
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