// src/pages/CreateProject/CreateProject.tsx
import React, {useEffect, useMemo, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {toast} from "sonner";
import styles from "./CreateProject.module.css";

import NewProjectModal from "../../components/NewProjectModal/NewProjectModal";
import {Alert} from "../../components/Alert/Alert";
import {useAuth} from "../../contexts/AuthContext";
import SectionHeader from "./components/SectionHeader";
import ProjectCard from "./components/ProjectCard";

// Icons
import NoProjectsAvailable from "./components/NoProjectsAvailable";
import { useProjects } from "@/hooks/useProjects";

type SortOption = "a-z" | "z-a";


const CreateProject: React.FC = () => {
    const navigate = useNavigate();
    const {user, loading} = useAuth();
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
    const location = useLocation();
    const [featuredProjectId, setFeaturedProjectId] = useState<string | null>(null);


    // Use Query to fetch user projects
    const {isLoading, data, isError, error, isSuccess} = useProjects()


    const processedProjects = useMemo(() => {
        if (!data) return []; // If no projects data yet, return empty array

        let currentProjects = [...data]; // Make a mutable copy

        // If there's a featuredProjectId, try to move that project to the front
        if (featuredProjectId) {
            const featuredIndex = currentProjects.findIndex(p => p.id === featuredProjectId);
            if (featuredIndex > -1) { // If the featured project is found
                const [featuredItem] = currentProjects.splice(featuredIndex, 1); // Remove it
                currentProjects.unshift(featuredItem); // Add it to the beginning
            }
        }

        // Now, apply search term filtering
        const searchTermLower = searchTerm.toLowerCase();
        let filtered = currentProjects.filter(
            (project) =>
                (project.name && project.name.toLowerCase().includes(searchTermLower)) ||
                (project.description && project.description.toLowerCase().includes(searchTermLower)) // Check if description exists
        );


        return filtered.sort((a, b) => {
            // If 'a' is the featured project, it should stay at the top relative to 'b' (unless b is also featured, which shouldn't happen here)
            if (a.id === featuredProjectId && filtered.length > 1 && filtered[0].id === a.id) return -1;
            // If 'b' is the featured project, it should stay at the top relative to 'a'
            if (b.id === featuredProjectId && filtered.length > 1 && filtered[0].id === b.id) return 1;

            switch (currentSort) {
                case "a-z":
                    return a.name.localeCompare(b.name);
                case "z-a":
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });
    }, [data, featuredProjectId, searchTerm, currentSort]);

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

    useEffect(() => {
        const lastViewedId = localStorage.getItem('lastViewedProjectId');
        if (lastViewedId) {
            setFeaturedProjectId(lastViewedId);
        }
    }, []);


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
        localStorage.setItem('lastViewedProjectId', projectId); // Store the ID
        navigate(`/project/${projectId}`); // Navigate as before
    };

    useEffect(() => {
        if (location.state?.toast) {
            toast.success(location.state.toast);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Renderizado condicional dentro del return en lugar de retornos tempranos
    if (isLoading || loading || !user) {
        return <div className={styles.loadingContainer}>Loading...</div>;
    }

    return (
        <>
            {/* <Toaster /> */}
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

                    <div className={styles.divider}/>

                    <div
                        className={`${styles.projectCards} ${
                            viewMode === "list" ? styles.listView : ""
                        }`}
                    >
                        {isLoading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.loadingSpinner}/>
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
                                {processedProjects.length > 0 ? (
                                    processedProjects.map((project, index) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            handleProjectClick={() => handleProjectClick(project.id)}
                                            isFeatured={index === 0 && project.id === featuredProjectId && viewMode === "grid"}
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
        </>
    );
};

export default CreateProject;