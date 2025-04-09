import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ProjectView,
  ProjectViewData,
} from "../../components/ProjectView/ProjectView";
import { projectService } from "../../services/projectService";
import styles from "./ProjectPage.module.css";
import LoadingSpinner from "../../components/Loading/LoadingSpinner";

// Extracted reusable UI components
// Replaced with new LoadingSpinner component
const LoadingState = () => (
  <div className={styles.stateContainer}>
    <LoadingSpinner
      text="Loading project data"
      subtext="Please wait while we fetch your project information..."
      size="large"
    />
  </div>
);

const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className={styles.stateContainer}>
    <div className={styles.iconContainer}>
      <span className={styles.errorIcon}>!</span>
    </div>
    <div className={styles.messageContainer}>
      <h2 className={styles.stateTitle}>Something went wrong</h2>
      <p className={styles.stateDescription}>{message}</p>
      <button onClick={onRetry} className={styles.actionButton}>
        Try Again
      </button>
    </div>
  </div>
);

const NotFoundState = ({
  onBackToProjects,
}: {
  onBackToProjects: () => void;
}) => (
  <div className={styles.stateContainer}>
    <div className={styles.iconContainer}>
      <span className={styles.errorIcon}>?</span>
    </div>
    <div className={styles.messageContainer}>
      <h2 className={styles.stateTitle}>Project Not Found</h2>
      <p className={styles.stateDescription}>
        The project you're looking for doesn't exist or you don't have access to
        it.
      </p>
      <button onClick={onBackToProjects} className={styles.actionButton}>
        Back to Projects
      </button>
    </div>
  </div>
);

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized navigation handlers
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchProject();
  };

  const handleBackToProjects = () => {
    navigate("/create");
  };

  // Extract the data fetching logic to a separate function for better readability
  const fetchProject = async () => {
    try {
      if (!id) throw new Error("Project ID is required");

      // Use Promise.all to fetch data in parallel
      const [projectData, membersData] = await Promise.all([
        projectService.getProject(id),
        projectService.getProjectMembers(id),
      ]);

      // Transform members data
      const teamMembers = membersData.map((member) => ({
        id: member.userId,
        name: member.name || "Unknown User",
        avatar:
          member.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            member.name || "Unknown"
          )}&background=random`,
      }));

      // Create base project data structure
      const transformedProject: ProjectViewData = {
        id: projectData.id || id,
        title: projectData.name || "Untitled Project",
        company: "Softtek Company",
        location: "Monterrey, MX",
        description: projectData.description || "No description available",
        currentSprint: {
          number: 1,
          startDate: "Mar 15, 2024",
          endDate: "Mar 29, 2024",
        },
        tasks: { todo: 0, inProgress: 0, completed: 0 },
        progress: { webDashboard: 0, database: 0 },
        team: teamMembers,
      };

      // Process tasks and calculate progress if items exist
      if (projectData.items && Array.isArray(projectData.items)) {
        transformedProject.tasks = calculateTaskCounts(projectData.items);
        transformedProject.progress = calculateProgress(
          transformedProject.tasks
        );
      }

      setProject(transformedProject);
    } catch (err) {
      console.error("Error fetching project:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch project");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for better code organization
  const calculateTaskCounts = (items) => {
    return items.reduce(
      (acc, item) => {
        // Process main item status
        updateTaskCount(acc, item.status);

        // Process sub-items if they exist
        if (item.items && Array.isArray(item.items)) {
          item.items.forEach((subItem) => {
            updateTaskCount(acc, subItem.status);
          });
        }

        return acc;
      },
      { todo: 0, inProgress: 0, completed: 0 }
    );
  };

  const updateTaskCount = (counts, status) => {
    if (status === "TODO" || status === "BACKLOG") {
      counts.todo++;
    } else if (status === "IN_PROGRESS") {
      counts.inProgress++;
    } else if (status === "COMPLETED" || status === "DONE") {
      counts.completed++;
    }
  };

  const calculateProgress = (taskCounts) => {
    const totalTasks =
      taskCounts.todo + taskCounts.inProgress + taskCounts.completed;

    if (totalTasks > 0) {
      const completionRate = (taskCounts.completed / totalTasks) * 100;
      return {
        webDashboard: Math.round(completionRate),
        database: Math.round(completionRate * 0.8),
      };
    }

    return { webDashboard: 0, database: 0 };
  };

  // Fetch data on component mount or id change
  useEffect(() => {
    fetchProject();
  }, [id]);

  // Render appropriate UI state
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRetry} />;
  }

  if (!project) {
    return <NotFoundState onBackToProjects={handleBackToProjects} />;
  }

  return <ProjectView project={project} />;
};

export default ProjectPage;
