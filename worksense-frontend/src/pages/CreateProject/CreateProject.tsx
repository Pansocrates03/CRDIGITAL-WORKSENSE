// src/pages/CreateProject/CreateProject.tsx
import React, { useState, useMemo, useEffect } from 'react';
import styles from './CreateProject.module.css';
import { SideBar } from '../../components/SideBar/SideBar';
import { Header } from '../../components/Header/Header';
import { NewProjectModal } from '../../components/NewProjectModal/NewProjectModal';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:5050';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'WIP' | 'DONE' | 'CANCELLED';
  lastChange: string;
}

type SortOption = 'last-change' | 'status' | 'a-z' | 'z-a';

const CreateProject: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>('last-change');
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/projects`);
      console.log('Response data:', response.data); // Debug log

      // Check if response.data is an array
      if (!Array.isArray(response.data)) {
        console.error('Response data is not an array:', response.data);
        setError('Invalid response format from server');
        return;
      }

      const projectsData: Project[] = response.data.map((project: any) => ({
        id: project.id || project._id || String(Date.now()),
        name: project.name || 'Unnamed Project',
        description: project.description || 'No description',
        status: 'WIP' as const,
        lastChange: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).toLowerCase()
      }));

      setProjects(projectsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please make sure the backend server is running.');
    }
  };

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();
    
    // First filter by search term
    let filtered = projects.filter(project => 
      project.name.toLowerCase().includes(searchTermLower) ||
      project.description.toLowerCase().includes(searchTermLower)
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

  const handleCreateProject = async (projectName: string, description: string) => {
    try {
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/projects`, {
        name: projectName,
        description: description
      });

      console.log('Create project response:', response.data); // Debug log

      const newProject: Project = {
        id: response.data.id || response.data._id || String(Date.now()),
        name: projectName,
        description: description,
        status: 'WIP',
        lastChange: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).toLowerCase()
      };

      setProjects([...projects, newProject]);
      setIsModalOpen(false);
      setError(null);
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project. Please try again.');
    }
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
          
          <h3>{user?.username || 'My'} projects</h3>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          <div className={styles.projectCards}>
            {filteredProjects.map((project) => (
              <div key={project.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h4>{project.name}</h4>
                  <span className={styles.cardArrow}>&#8250;</span>
                </div>
                <p className={styles.projectInfo}>{project.description}</p>
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
