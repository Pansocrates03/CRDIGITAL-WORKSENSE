import React, {useEffect, useState} from 'react';
import styles from "./CreateProject.module.css"; // Assuming this is where sectionHeader styles are
import {Plus, Search, SlidersHorizontal, X,} from "lucide-react";

// A simple Waving Hand emoji or a component if you have one
const WavingHandIcon = () => <span role="img" aria-label="waving hand"
                                   style={{marginRight: '8px', fontSize: 'inherit'}}>👋</span>;

type SortOption = "a-z" | "z-a";

interface SectionHeaderProps {
    loading: boolean;
    user: {
        fullName?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    // ... other props
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

const SectionHeader: React.FC<SectionHeaderProps> = ({
                                                         loading,
                                                         user,
                                                         searchTerm,
                                                         // ... other props destructured
                                                         setSearchTerm,
                                                         handleClearSearch,
                                                         viewMode,
                                                         setViewMode,
                                                         isFilterOpen,
                                                         setIsFilterOpen,
                                                         currentSort,
                                                         handleFilterSelect,
                                                         setIsModalOpen
                                                     }) => {
    const [greeting, setGreeting] = useState("Welcome");
    const [animateWelcome, setAnimateWelcome] = useState(false);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting("Good morning");
        } else if (hour < 18) {
            setGreeting("Good afternoon");
        } else {
            setGreeting("Good evening");
        }

        // Trigger animation after a short delay to ensure it's visible
        const timer = setTimeout(() => {
            setAnimateWelcome(true);
        }, 100); // Adjust delay as needed

        return () => clearTimeout(timer); // Cleanup timer
    }, []);

    const userName = user?.fullName ||
        (user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.firstName || user?.email?.split("@")[0] || "User");

    return (
        <div className={styles.sectionHeader}>
            <div className={`${styles.welcomeMessage} ${animateWelcome ? styles.welcomeAnimation : ''}`}>
                <h2 className={styles.welcomeTitle}>
                    {loading
                        ? "Loading..."
                        : <>

                            {greeting},{' '}
                            <span className={styles.userNameHighlight}>
                                {userName}
                            </span>
                            
                        </>
                    }
                </h2>
                <p className={styles.welcomeText}>
                    Manage your agile projects and organize your sprints efficiently.
                </p>
            </div>

            {/* Search, filter, and view mode controls */}
            <div className={styles.compactControls}>
                {/* ... your existing controls ... */}
                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} size={18}/>

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
                            <X size={16}/>
                        </button>)}
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
                                <rect x="1" y="1" width="6" height="6" rx="1"/>
                                <rect x="9" y="1" width="6" height="6" rx="1"/>
                                <rect x="1" y="9" width="6" height="6" rx="1"/>
                                <rect x="9" y="9" width="6" height="6" rx="1"/>
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
                                <rect x="1" y="1" width="14" height="3" rx="1"/>
                                <rect x="1" y="6" width="14" height="3" rx="1"/>
                                <rect x="1" y="11" width="14" height="3" rx="1"/>
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
                            <SlidersHorizontal size={18}/>
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
                        <Plus size={18}/>
                        New Project
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SectionHeader;