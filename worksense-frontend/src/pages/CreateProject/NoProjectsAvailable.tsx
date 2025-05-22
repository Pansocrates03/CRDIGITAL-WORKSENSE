import React from 'react';
import styles from "./CreateProject.module.css";
import {Cuboid, Plus} from "lucide-react";
import {Button} from "@/components/ui/button";

type NoProjectsAvailableProps = {
    setIsModalOpen: (isOpen: boolean) => void;
}

const NoProjectsAvailable: React.FC<NoProjectsAvailableProps> = ({setIsModalOpen}) => {
    return (
        <div className={styles.emptyState}>
            <Cuboid alt="No projects yet" color="var(--accent-pink)" size="100px"/>
            <h3 className={styles.emptyStateTitle}>Ready to Start Something Awesome?</h3>
            <p className={styles.emptyStateText}>
                It looks like you don't have any projects yet.
                Let's get your first one set up!
            </p>
            <Button variant={"default"} className={styles.createFirstButton} onClick={() => setIsModalOpen(true)}>
                <Plus size={20}/> Create Your First Project
            </Button>
        </div>
    )
};

export default NoProjectsAvailable;