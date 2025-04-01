import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any auth tokens/state
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <h2>My Projects</h2>
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