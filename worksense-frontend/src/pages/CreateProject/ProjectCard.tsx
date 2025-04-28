import React from 'react';
import styles from "./CreateProject.module.css";
import { ArrowRight, Calendar } from "lucide-react";

type ProjectCardProps = {
    project: {
        id: string;
        name: string;
        description: string;
        status: string;
        items: Array<{ status: string }>;
        members: Array<{ id: string; name: string; avatar?: string }>;
        lastChange: string;
    };
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
                        project.status
                    )}`}
                    >
                    {project.status}
                    </div>
                </div>
                <p className={styles.projectInfo}>
                    {project.description}
                </p>
                </div>
            </div>

            <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
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
                </div>
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
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.metaInfo}>
                <div className={styles.memberAvatars}>
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
                </div>
                <div className={styles.metaItem}>
                    <Calendar size={16} className={styles.metaIcon} />
                    <span>{project.lastChange}</span>
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