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
            {/* Project icon will go here */}
          </div>
          <div className={styles.projectInfo}>
            <h1>{project.title}</h1>
            <div className={styles.projectMeta}>
              <span>{project.company}</span>
              <span>{project.location}</span>
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
              <li>To Do: {project.tasks.todo} task</li>
              <li>In Progress: {project.tasks.inProgress} tasks</li>
              <li>Completed: {project.tasks.completed} tasks</li>
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
                <img src={member.avatar} alt={member.name} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}; 