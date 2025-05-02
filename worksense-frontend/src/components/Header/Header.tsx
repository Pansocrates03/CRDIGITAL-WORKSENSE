// src/components/Header/Header.tsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { authService } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";

interface HeaderProps {
  /** Current section/page name */
  title: string;
  /** Project name to display in breadcrumb */
  projectNameForBreadcrumb?: string;
  /** Whether to show the back button */
  showBackButton?: boolean;
  /** Whether to show the breadcrumb navigation */
  showBreadcrumb?: boolean;
  /** Project ID for potential future use */
  projectId?: string;
  /** URL to navigate to when back button is clicked */
  backUrl?: string;
  /** URL to navigate to when "My Projects" is clicked */
  projectsUrl?: string;
}

/**
 * Application header component with breadcrumb navigation and user menu
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  projectNameForBreadcrumb,
  showBackButton = false,
  showBreadcrumb = false,
  projectId,
  backUrl = "/create",
  projectsUrl = "/create",
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserProfile();


  // Handler for user logout
  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  // Handler for back button
  const handleBack = () => {
    navigate(backUrl);
  };

  // Handler for projects link in breadcrumb
  const handleProjectsClick = () => {
    navigate(projectsUrl);
  };

  // Close menu when clicking outside
  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  // Toggle menu state
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Add event listener to close menu when clicking outside
  React.useEffect(() => {
    if (isMenuOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest(`.${styles.avatarContainer}`)) {
          handleMenuClose();
        }
      };

      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        {/* Back Button */}
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
              aria-hidden="true"
              data-testid="back-icon"
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

        {/* Breadcrumb Navigation */}
        {showBreadcrumb ? (
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <button
              onClick={handleProjectsClick}
              className={styles.breadcrumbLink}
              data-testid="projects-link"
            >
              My Projects
            </button>
            <span className={styles.breadcrumbSeparator} aria-hidden="true">
              /
            </span>
            {/* Project Name */}
            <span className={styles.breadcrumbCurrent}>
              {projectNameForBreadcrumb || "Project"}
            </span>
            <span className={styles.breadcrumbSeparator} aria-hidden="true">
              /
            </span>
            {/* Current Section */}
            <span
              className={styles.breadcrumbCurrent}
              aria-current="page"
              data-testid="current-section"
            >
              {title}
            </span>
          </nav>
        ) : (
          // Page Title
          <h2 className={styles.headerTitle} data-testid="page-title">
            {title}
          </h2>
        )}
      </div>

      {/* User Menu */}
      <div className={styles.headerActions}>
        <div className={styles.avatarContainer}>
          <button
            className={styles.avatar}
            onClick={toggleMenu}
            aria-label="User menu"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            data-testid="user-menu-button"
          >
            <AvatarDisplay 
              user={{
                firstName: user?.firstName,
                lastName: user?.lastName,
                profilePicture: profile?.avatar
              }}
              size="sm"
            />
          </button>

          {isMenuOpen && (
            <div
              className={styles.dropdownMenu}
              role="menu"
              data-testid="user-menu"
            >
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
                data-testid="logout-button"
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

export default Header;
