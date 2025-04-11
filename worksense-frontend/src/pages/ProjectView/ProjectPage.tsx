import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ProjectView,
  ProjectViewData,
} from "../../components/ProjectView/ProjectView";
import { projectService } from "../../services/projectService";
import styles from "./ProjectPage.module.css";
import LoadingSpinner from "../../components/Loading/LoadingSpinner";

// Extracted reusable UI components
const LoadingState = () => (
  <div className={styles.stateContainer}>
    <LoadingSpinner
      text="Loading project data"
      subtext="Please wait while we fetch your project information..."
      size="large"
    />
  </div>
);

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className={styles.stateContainer}>
    <div className={styles.iconContainer}>
      <span className={styles.errorIcon}>!</span>
    </div>
    <div className={styles.messageContainer}>
      <h2 className={styles.stateTitle}>Error Loading Project</h2>
      <p className={styles.stateDescription}>{message}</p>
      <button className={styles.actionButton} onClick={onRetry}>
        Try Again
      </button>
    </div>
  </div>
);

const NotFoundState: React.FC<{ onBackToProjects: () => void }> = ({
  onBackToProjects,
}) => (
  <div className={styles.stateContainer}>
    <div className={styles.iconContainer}>
      <span className={styles.errorIcon}>?</span>
    </div>
    <div className={styles.messageContainer}>
      <h2 className={styles.stateTitle}>Project Not Found</h2>
      <p className={styles.stateDescription}>
        We couldn't find the project you're looking for. It may have been deleted
        or you may not have access to it.
      </p>
      <button className={styles.actionButton} onClick={onBackToProjects}>
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

      console.log("Raw members data from API:", membersData);

      // Transform members data
      const teamMembers = membersData.map((member) => ({
        id: parseInt(member.userId, 10),
        name: member.fullName || member.name || "Unknown User",
        role: member.roleId && typeof member.roleId === 'string' && member.roleId.includes('admin') ? 'Admin' : 'Team Member',
        avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName || member.name || "Unknown")}&background=random`,
        email: member.email,
        userId: member.userId,
        projectId: member.projectId,
        roleId: member.roleId,
        status: member.status || "Active",
        createdAt: member.createdAt,
        updatedAt: member.updatedAt
      }));

      console.log("Transformed team members:", teamMembers);

      // Create base project data structure
      const transformedProject: ProjectViewData = {
        id: projectData.id || id,
        name: projectData.name || "Untitled Project",
        description: projectData.description || "No description available",
        currentSprint: {
          number: 1,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        team: teamMembers
      };

      setProject(transformedProject);
      setError(null);
    } catch (err) {
      console.error("Error fetching project:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch project");
    } finally {
      setLoading(false);
    }
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
