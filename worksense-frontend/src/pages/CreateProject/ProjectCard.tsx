import React from 'react';
import styles from "./CreateProject.module.css";
import { ArrowRight, Calendar } from "lucide-react";
import ProjectDetails from '@/types/ProjectType';

type ProjectCardProps = {
    project: ProjectDetails;
    handleProjectClick: (id: string) => void;
}

const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

const projectCard: React.FC<ProjectCardProps>  = ({ project, handleProjectClick }) => {
    return (
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
                        //project.status
                        "ACTIVE" // // Cambia esto por project.status si es necesario
                    )}`}
                    >
                    {/* project.status */}
                    </div>
                </div>
                <p className={styles.projectInfo}>
                    {project.description}
                </p>
                </div>
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.metaInfo}>
                
                <div className={styles.metaItem}>
                    <Calendar size={16} className={styles.metaIcon} />
                   {/*<span>{project.lastChange}</span>*/}
                   <span>Project last change...</span>
                </div>
                </div>
                <div className={styles.cardAction}>
                <ArrowRight size={18} />
                </div>
            </div>
            </div>
    )
}

export default projectCard;