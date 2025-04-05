import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { authService } from "@/services/auth";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any auth tokens/state
    authService.logout();
    // Redirect to login page
    navigate("/login");
  };

  const handleBack = () => {
    navigate("/create");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        {showBackButton && (
          <button className={styles.backButton} onClick={handleBack}>
            ←
          </button>
        )}
        <h2>{title}</h2>
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
              <button className={styles.menuItem} onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
