// src/pages/CreateProject/CreateProject.tsx
import React, { useState, useMemo } from 'react';
import styles from './CreateProject.module.css';
import { SideBar } from '../../components/SideBar/SideBar';
import { Header } from '../../components/Header/Header';
import { NewProjectModal } from '../../components/NewProjectModal/NewProjectModal';

interface Project {
  id: string;
  name: string;
  region: string;
  status: 'WIP' | 'DONE' | 'CANCELLED';
  lastChange: string;
}

const CreateProject: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Mi proyecto',
      region: 'aws | us west 1',
      status: 'DONE',
      lastChange: 'feb 12, 2024'
    },
    {
      id: '2',
      name: 'Mi proyecto',
      region: 'aws | us west 1',
      status: 'WIP',
      lastChange: 'feb 12, 2024'
    },
    {
      id: '3',
      name: 'Mi proyecto',
      region: 'aws | us west 1',
      status: 'CANCELLED',
      lastChange: 'feb 12, 2024'
    }
  ]);

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();
    return projects.filter(project => 
      project.name.toLowerCase().includes(searchTermLower) ||
      project.region.toLowerCase().includes(searchTermLower)
    );
  }, [projects, searchTerm]);

  const handleCreateProject = (projectName: string, region: string) => {
    const newProject: Project = {
      id: Date.now().toString(), // In a real app, this would come from the backend
      name: projectName,
      region: region,
      status: 'WIP',
      lastChange: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).toLowerCase()
    };

    setProjects([...projects, newProject]);
    setIsModalOpen(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className={styles.pageContainer}>
      <SideBar />
      <main className={styles.mainContent}>
        <Header />
        <section className={styles.projectsSection}>
          <div className={styles.projectsHeader}>
            <button 
              className={styles.newProjectButton}
              onClick={() => setIsModalOpen(true)}
            >
              New Project
            </button>
            <div className={styles.searchContainer}>
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
                  ✕
                </button>
              )}
            </div>
            <button className={styles.filterButton}>
              <img src='/Filter Button.svg' alt="Filter" />
            </button>
          </div>
          
          <h3>Victor Ortega's projects</h3>
          <div className={styles.projectCards}>
            {filteredProjects.map((project) => (
              <div key={project.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h4>{project.name}</h4>
                  <span className={styles.cardArrow}>&#8250;</span>
                </div>
                <p className={styles.projectInfo}>{project.region}</p>
                <span className={`${styles.status} ${styles[project.status.toLowerCase()]}`}>
                  {project.status}
                </span>
                <div className={styles.cardFooter}>
                  <span className={styles.lastChange}>Last change: {project.lastChange}</span>
                </div>
              </div>
            ))}
            {filteredProjects.length === 0 && searchTerm && (
              <div className={styles.noResults}>
                No projects found matching "{searchTerm}"
              </div>
            )}
          </div>
        </section>

        <NewProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      </main>
    </div>
  );
};

export default CreateProject;
