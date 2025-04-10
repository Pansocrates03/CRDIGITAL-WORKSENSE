import React, { useEffect, useState } from "react";
import styles from "./ProjectView.module.css";
import { useParams } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { BacklogItemType } from "@/types";
import LoadingSpinner from "../Loading/LoadingSpinner";

export interface ProjectViewData {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  currentSprint: {
    number: number;
    startDate: string;
    endDate: string;
  };
  team: Array<{
    id: string;
    avatar: string;
    name: string;
  }>;
}

interface ProjectViewProps {
  project: ProjectViewData;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ project }) => {
  const { id } = useParams<{ id: string }>();
  const [backlogItems, setBacklogItems] = useState<BacklogItemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBacklogItems = async () => {
      try {
        const response = await apiClient.get(`/projects/${id}/items`);
        const items = response.data;
        setBacklogItems(items);
      } catch (error) {
        console.error('Error fetching backlog items:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBacklogItems();
    }
  }, [id]);

  return (
    <div className={styles.projectView}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.projectIcon}>
          <span style={{ fontSize: "1.5rem", color: "var(--color-purple)" }}>
            {project.title.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className={styles.projectInfo}>
          <h1>{project.title}</h1>
          <div className={styles.projectMeta}>
            <span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
                  fill="currentColor"
                />
                <path
                  d="M8 9C5.23858 9 3 11.2386 3 14H13C13 11.2386 10.7614 9 8 9Z"
                  fill="currentColor"
                />
              </svg>
              {project.company}
            </span>
            <span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
                  fill="currentColor"
                />
                <path
                  d="M8 9C5.23858 9 3 11.2386 3 14H13C13 11.2386 10.7614 9 8 9Z"
                  fill="currentColor"
                />
              </svg>
              {project.location}
            </span>
          </div>
        </div>
      </div>

      {/* About Section */}
      <section className={styles.aboutSection}>
        <h2>About the project</h2>
        <p>{project.description}</p>
      </section>

      {/* Sprint Status */}
      <div className={styles.sprintStatus}>
        <div className={styles.currentSprint}>
          <h3>Sprint {project.currentSprint.number}</h3>
          <p>
            {project.currentSprint.startDate} - {project.currentSprint.endDate}
          </p>
        </div>
      </div>

      {/* Backlog Preview Section */}
      <section className={styles.backlogPreview}>
        <h2>Recent Backlog Items</h2>
        {loading ? (
          <LoadingSpinner text="Loading backlog items..." />
        ) : (
          <div className={styles.backlogItems}>
            {backlogItems.slice(0, 5).map((item) => (
              <div key={item.id} className={styles.backlogItem}>
                <div className={styles.backlogItemHeader}>
                  <span className={styles.itemType}>{item.type}</span>
                  <span className={`${styles.itemStatus} ${styles[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <div className={styles.itemMeta}>
                  <span>Priority: {item.priority}</span>
                  {item.size !== undefined && item.size > 0 && <span>Size: {item.size}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <h2>Project Team</h2>
        <div className={styles.teamAvatars}>
          {project.team.map((member) => (
            <div key={member.id} className={styles.avatar}>
              <div className={styles.avatarImage}>
                <img src={member.avatar} alt={member.name} />
                <div className={styles.avatarTooltip}>{member.name}</div>
              </div>
              <span className={styles.avatarName}>{member.name}</span>
            </div>
          ))}
        </div>

        <div className={styles.teamStats}>
          <h3>Project Statistics</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {backlogItems.length}
                <span className={styles.statLabel}>Total Tasks</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {backlogItems.filter(item => item.type === 'epic').length}
                <span className={styles.statLabel}>Epics</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {backlogItems.filter(item => item.status === 'in-progress').length}
                <span className={styles.statLabel}>In Progress</span>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {backlogItems.filter(item => item.status === 'done').length}
                <span className={styles.statLabel}>Completed</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
