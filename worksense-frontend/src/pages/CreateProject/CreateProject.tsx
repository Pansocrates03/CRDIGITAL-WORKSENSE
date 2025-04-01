// src/pages/CreateProject/CreateProject.tsx
import React from 'react';
import styles from './CreateProject.module.css';
import { SideBar } from '../../components/SideBar/SideBar';
import { Header } from '../../components/Header/Header';

const CreateProject: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      <SideBar />
      <main className={styles.mainContent}>
        <Header />
        <section className={styles.projectsSection}>
          <div className={styles.projectsHeader}>
            <button className={styles.newProjectButton}>New Project</button>
            <div className={styles.searchContainer}>
              <input className={styles.searchInput} placeholder="Value" />
              <button className={styles.clearSearch}>✕</button>
            </div>
            <button className={styles.filterButton}>
              <img src='/Filter Button.svg' alt="Filter" />
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
