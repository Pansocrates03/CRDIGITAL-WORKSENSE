import React from 'react';
import styles from "./CreateProject.module.css";

type NoProjectsAvailableProps = {
    setIsModalOpen: (isOpen: boolean) => void;
}

const NoProjectsAvailable: React.FC<NoProjectsAvailableProps> = ( {setIsModalOpen} ) => {
    return (
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
    )
}

export default NoProjectsAvailable;