import { useParams, useNavigate } from "react-router-dom";
import { ProjectView } from "../../components/ProjectView/ProjectView";
import styles from "./ProjectPage.module.css";
import LoadingSpinner from "../../components/Loading/LoadingSpinner";


import React from 'react';
import ProjectDetails from '@/types/ProjectType';
import { projectService } from "@/services/projectService";

import { useQuery } from "@tanstack/react-query";
import MemberDetailed from "@/types/MemberDetailedType";

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

  // Use Query to fetch project and members
  const { 
    data: project, 
    isLoading: projectLoading, 
    isError: projectError, 
    error: projectErrorMessage 
  } = useQuery<ProjectDetails>({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id) throw new Error("Project ID is required");
      const res = await projectService.fetchProjectDetails(id);
      return res;
    },
  });

  const { 
    data: members, 
    isLoading: membersLoading, 
    isError: membersError, 
    error: membersErrorMessage 
  } = useQuery<MemberDetailed[]>({
    queryKey: ["projectMembers", id],
    queryFn: async () => {
      if (!id) throw new Error("Project ID is required");
      const res = await projectService.fetchProjectMembersDetailed(id);
      return res;
    },
    enabled: !!project, // Only fetch members if project data is available
  });

  // Memoized navigation handlers
  const handleRetry = () => window.location.reload();
  const handleBackToProjects = () => navigate("/create");

  // Improved render logic with clearer loading states
  if (projectLoading || (membersLoading && !!project)) {
    return <LoadingState />;
  }

  // Only show not found if we're done loading and the project doesn't exist
  if (!projectLoading && !project) {
    return <NotFoundState onBackToProjects={handleBackToProjects} />;
  }

  // Handle errors
  if (projectError) {
    return <ErrorState message={projectErrorMessage.message} onRetry={handleRetry} />;
  }

  if (membersError && project) {
    return <ErrorState message={membersErrorMessage.message} onRetry={handleRetry} />;
  }

  // Only render the ProjectView when we have both project and members
  if (project && members) {
    return <ProjectView project={project} members={members} />;
  }

  // Fallback loading state (should rarely hit this)
  return <LoadingState />;
};

export default ProjectPage;