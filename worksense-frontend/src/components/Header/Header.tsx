// src/components/Header/Header.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { authService } from "@/services/auth"; // Assuming path is correct
import { useAuth } from "@/contexts/AuthContext"; // Importar contexto de autenticación

interface HeaderProps {
  title: string; // This will now represent the current section/page name
  projectNameForBreadcrumb?: string; // Explicit prop for project name in breadcrumb
  showBackButton?: boolean;
  showBreadcrumb?: boolean;
  projectId?: string; // Keep for potential future use or context
}

export const Header: React.FC<HeaderProps> = ({
  title,
  projectNameForBreadcrumb, // Use the new prop
  showBackButton = false,
  showBreadcrumb = false,
  // projectId prop remains available if needed elsewhere
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // Obtener el usuario del contexto

  // Función para obtener las iniciales del usuario
  const getUserInitials = (): string => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(
        0
      )}`.toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U"; // Default
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true }); // Use replace for login redirect
  };

  const handleBack = () => {
    // Navigate back to the main projects view, typically '/create' in your setup
    navigate("/create");
  };

  const handleProjectsClick = () => {
    // Link in breadcrumb also goes to '/create'
    navigate("/create");
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        {showBackButton && (
          <button
            className={styles.backButton}
            onClick={handleBack}
            aria-label="Go back to projects"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true" // Hide decorative SVG from screen readers
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Breadcrumb display logic */}
        {showBreadcrumb ? (
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <button
              onClick={handleProjectsClick}
              className={styles.breadcrumbLink}
            >
              My Projects
            </button>
            <span className={styles.breadcrumbSeparator} aria-hidden="true">
              /
            </span>
            {/* Display the Project Name */}
            <span className={styles.breadcrumbCurrent}>
              {projectNameForBreadcrumb || "Project"}{" "}
              {/* Use passed name or fallback */}
            </span>
            <span className={styles.breadcrumbSeparator} aria-hidden="true">
              /
            </span>
            {/* Display the Current Section (passed as title) */}
            <span className={styles.breadcrumbCurrent} aria-current="page">
              {title} {/* 'title' prop now represents the current section */}
            </span>
          </nav>
        ) : (
          // Display title as heading when not showing breadcrumbs
          <h2 className={styles.headerTitle}>{title}</h2>
        )}
      </div>

      {/* Header Actions (Avatar/Logout) */}
      <div className={styles.headerActions}>
        <div className={styles.avatarContainer}>
          <button
            className={styles.avatar}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="User menu"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            {/* Mostrar iniciales del usuario en lugar de imagen */}
            <div className={styles.avatarInitials}>{getUserInitials()}</div>
          </button>

          {isMenuOpen && (
            <div className={styles.dropdownMenu} role="menu">
              {user && (
                <div className={styles.userInfo}>
                  <p className={styles.userName}>
                    {user.fullName || user.email}
                  </p>
                  <p className={styles.userEmail}>{user.email}</p>
                </div>
              )}
              <button
                className={styles.menuItem}
                role="menuitem"
                onClick={handleLogout}
              >
                Logout
              </button>
              {/* Add other menu items here (e.g., Profile, Settings) */}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
