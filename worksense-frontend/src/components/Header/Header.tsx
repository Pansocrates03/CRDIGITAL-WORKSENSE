import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Header.module.css';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  showBreadcrumb?: boolean;
  projectId?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBackButton = false,
  showBreadcrumb = false,
  projectId
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any auth tokens/state
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/create');
  };

  const handleProjectsClick = () => {
    navigate('/create');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        {showBackButton && (
          <button 
            className={styles.backButton}
            onClick={handleBack}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        {showBreadcrumb ? (
          <div className={styles.breadcrumb}>
            <button onClick={handleProjectsClick} className={styles.breadcrumbLink}>My Projects</button>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>Project Overview</span>
          </div>
        ) : (
          <h2>{title}</h2>
        )}
      </div>
      <div className={styles.headerActions}>
        <div className={styles.avatarContainer}>
          <button 
            className={styles.avatar}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <img src="/avatar.svg" alt="User" />
          </button>
          
          {isMenuOpen && (
            <div className={styles.dropdownMenu}>
              <button 
                className={styles.menuItem}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}; 