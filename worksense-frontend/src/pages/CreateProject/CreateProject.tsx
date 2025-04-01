// src/pages/CreateProject/CreateProject.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CreateProject.module.css';

const CreateProject: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src="/WorkSenseLogo.svg" alt="WorkSense Logo" />
        </div>

        <nav>
          <ul>
            <li className={styles.active}>
              <span className={styles.icon}><img src="/Book open.png" alt="Projects" /></span> My Projects
            </li>
            <li>
              <span className={styles.icon}><img src="/Home.png" alt="Account" /></span> Account
            </li>
          </ul>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h2>My Projects</h2>
          <div className={styles.headerActions}>
            <div className={styles.avatar}>
              <img src="/avatar.png" alt="User" />
            </div>
          </div>
        </header>

        <section className={styles.projectsSection}>
          <div className={styles.projectsHeader}>
            <button className={styles.newProjectButton}>New Project</button>
            <div className={styles.searchContainer}>
              <input className={styles.searchInput} placeholder="Value" />
              <button className={styles.clearSearch}>✕</button>
            </div>
            <button className={styles.filterButton}>
              <img src='/Filter Button.png' alt="Filter" />
            </button>
          </div>
          
          <h3>Victor Ortega's projects</h3>
          <div className={styles.projectCards}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h4>Mi proyecto</h4>
                <span className={styles.cardArrow}>&#8250;</span>
              </div>
              <p className={styles.projectInfo}>aws | us west 1</p>
              <span className={`${styles.status} ${styles.done}`}>DONE</span>
              <div className={styles.cardFooter}>
                <span className={styles.lastChange}>Last change: feb 12, 2024</span>
              </div>
            </div>
            
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h4>Mi proyecto</h4>
                <span className={styles.cardArrow}>&#8250;</span>
              </div>
              <p className={styles.projectInfo}>aws | us west 1</p>
              <span className={`${styles.status} ${styles.wip}`}>WIP</span>
              <div className={styles.cardFooter}>
                <span className={styles.lastChange}>Last change: feb 12, 2024</span>
              </div>
            </div>
            
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h4>Mi proyecto</h4>
                <span className={styles.cardArrow}>&#8250;</span>
              </div>
              <p className={styles.projectInfo}>aws | us west 1</p>
              <span className={`${styles.status} ${styles.cancelled}`}>CANCELLED</span>
              <div className={styles.cardFooter}>
                <span className={styles.lastChange}>Last change: feb 12, 2024</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CreateProject;
