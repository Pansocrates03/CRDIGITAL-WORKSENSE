import React from 'react';
import styles from './ProjectView.module.css';
import { Header } from '../Header/Header';
import { useParams } from 'react-router-dom';

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
  tasks: {
    todo: number;
    inProgress: number;
    completed: number;
  };
  progress: {
    webDashboard: number;
    database: number;
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

  return (
    <div className={styles.projectViewContainer}>
      <Header 
        title={project.title} 
        showBackButton 
        showBreadcrumb
        projectId={id}
      />
      <div className={styles.projectView}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.projectIcon}>
            <span style={{ fontSize: '1.5rem', color: 'var(--color-purple)' }}>
              {project.title.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className={styles.projectInfo}>
            <h1>{project.title}</h1>
            <div className={styles.projectMeta}>
              <span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" fill="currentColor"/>
                  <path d="M8 9C5.23858 9 3 11.2386 3 14H13C13 11.2386 10.7614 9 8 9Z" fill="currentColor"/>
                </svg>
                {project.company}
              </span>
              <span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" fill="currentColor"/>
                  <path d="M8 9C5.23858 9 3 11.2386 3 14H13C13 11.2386 10.7614 9 8 9Z" fill="currentColor"/>
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
            <p>{project.currentSprint.startDate} - {project.currentSprint.endDate}</p>
          </div>
          
          <div className={styles.workProgress}>
            <h3>Work in Progress</h3>
            <ul>
              <li>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
                </svg>
                To Do: {project.tasks.todo} task{project.tasks.todo !== 1 ? 's' : ''}
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                In Progress: {project.tasks.inProgress} task{project.tasks.inProgress !== 1 ? 's' : ''}
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Completed: {project.tasks.completed} task{project.tasks.completed !== 1 ? 's' : ''}
              </li>
            </ul>
          </div>
        </div>

        {/* Progress Section */}
        <section className={styles.progressSection}>
          <div className={styles.progressItem}>
            <div className={styles.progressHeader}>
              <h3>Web Dashboard</h3>
              <span>{project.progress.webDashboard}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${project.progress.webDashboard}%` }}
              />
            </div>
            <span className={styles.daysLeft}>5 days left</span>
          </div>

          <div className={styles.progressItem}>
            <div className={styles.progressHeader}>
              <h3>Database</h3>
              <span>{project.progress.database}%</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${project.progress.database}%` }}
              />
            </div>
            <span className={styles.daysLeft}>5 days left</span>
          </div>
        </section>

        {/* Team Section */}
        <section className={styles.teamSection}>
          <h2>Project Team</h2>
          <div className={styles.teamAvatars}>
            {project.team.map((member) => (
              <div key={member.id} className={styles.avatar}>
                <div className={styles.avatarImage}>
                  <img src={member.avatar} alt={member.name} />
                  <div className={styles.avatarTooltip}>
                    {member.name}
                  </div>
                </div>
                <span className={styles.avatarName}>{member.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}; 