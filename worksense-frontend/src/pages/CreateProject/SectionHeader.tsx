import React from 'react';
import styles from "./CreateProject.module.css";
import {
    Search,
    X,
    SlidersHorizontal,
    Plus,
  } from "lucide-react";


type SortOption =  "a-z" | "z-a";
interface SectionHeaderProps {
    loading: boolean;
    user: {
        fullName?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    handleClearSearch: () => void;
    viewMode: "grid" | "list";
    setViewMode: (mode: "grid" | "list") => void;
    isFilterOpen: boolean;
    setIsFilterOpen: (isOpen: boolean) => void;
    currentSort: string;
    handleFilterSelect: (sortOption: SortOption) => void;
    setIsModalOpen: (isOpen: boolean) => void;
}


const SectionHeader: React.FC<SectionHeaderProps> = ({ loading, user, searchTerm, viewMode, isFilterOpen, currentSort, setSearchTerm, handleClearSearch,setViewMode,setIsFilterOpen,handleFilterSelect,setIsModalOpen }) => {
    return (
        <div className={styles.sectionHeader}>

          {/* Welcome message and controls for search, filter, and view mode */}
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

          {/* Search, filter, and view mode controls */}
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


              {/* View mode toggle buttons for grid and list views */}
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

                {/* Filter button to sort projects */}
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

            {/* Button to create a new project */}
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
    )
}

export default SectionHeader;