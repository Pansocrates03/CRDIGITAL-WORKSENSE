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

type SortOption = 'last-change' | 'status' | 'a-z' | 'z-a';

const CreateProject: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>('last-change');
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

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();
    
    // First filter by search term
    let filtered = projects.filter(project => 
      project.name.toLowerCase().includes(searchTermLower) ||
      project.region.toLowerCase().includes(searchTermLower)
    );

    // Then sort based on current sort option
    return filtered.sort((a, b) => {
      switch (currentSort) {
        case 'last-change':
          return new Date(b.lastChange).getTime() - new Date(a.lastChange).getTime();
        case 'status':
          const statusOrder = { 'WIP': 1, 'DONE': 2, 'CANCELLED': 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        case 'a-z':
          return a.name.localeCompare(b.name);
        case 'z-a':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [projects, searchTerm, currentSort]);

  const handleCreateProject = (projectName: string, region: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
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

  const handleFilterSelect = (option: SortOption) => {
    setCurrentSort(option);
    setIsFilterOpen(false);
  };

  // Close filter dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const filterButton = document.querySelector(`.${styles.filterButton}`);
      const filterDropdown = document.querySelector(`.${styles.filterDropdown}`);
      
      if (filterButton && filterDropdown && 
          !filterButton.contains(event.target as Node) && 
          !filterDropdown.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <div className={styles.filterContainer}>
              <button 
                className={`${styles.filterButton} ${isFilterOpen ? styles.active : ''}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <img src='/Filter Button.svg' alt="Filter" />
              </button>
              {isFilterOpen && (
                <div className={styles.filterDropdown}>
                  <button 
                    className={`${styles.filterOption} ${currentSort === 'last-change' ? styles.active : ''}`}
                    onClick={() => handleFilterSelect('last-change')}
                  >
                    Last Change
                  </button>
                  <button 
                    className={`${styles.filterOption} ${currentSort === 'status' ? styles.active : ''}`}
                    onClick={() => handleFilterSelect('status')}
                  >
                    Status
                  </button>
                  <button 
                    className={`${styles.filterOption} ${currentSort === 'a-z' ? styles.active : ''}`}
                    onClick={() => handleFilterSelect('a-z')}
                  >
                    A-Z
                  </button>
                  <button 
                    className={`${styles.filterOption} ${currentSort === 'z-a' ? styles.active : ''}`}
                    onClick={() => handleFilterSelect('z-a')}
                  >
                    Z-A
                  </button>
                </div>
              )}
            </div>
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
