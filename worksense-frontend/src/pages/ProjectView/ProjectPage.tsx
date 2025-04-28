import { useParams, useNavigate } from "react-router-dom";
import { ProjectView } from "../../components/ProjectView/ProjectView";
import styles from "./ProjectPage.module.css";
import LoadingSpinner from "../../components/Loading/LoadingSpinner";


import React, { useEffect, useState } from 'react';
import ProjectDetails from '@/types/ProjectType';
import Member from "@/types/MemberType";

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
  
  const { getProjectDetails } = useProject();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      setError(null);

      if(!id) {
        console.log("Could not get ID");
        return;
      }
      
      try {
        const projectData = await getProjectDetails(id);
        setProject(projectData);
      } catch (err) {
        setError('Error al cargar el proyecto');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadProject();
  }, [id, getProjectDetails]);


  const { getProjectMembers } = useMembers();
  const [members, setMembers] = useState<Member[] | null>(null);


  useEffect(() => {
    async function loadProjectMembers() {
      setLoading(true)
      setError(null)

      if(!id) {
        console.log("Could not get ID");
        return;
      }

      try {
        const membersData = await getProjectMembers(id);
        setMembers(membersData)
      } catch (err) {
        setError('Error al cargar los miembros');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProjectMembers()
  }, [id, getProjectMembers])



  // Memoized navigation handlers
  const handleRetry = () => window.location.reload();
  const handleBackToProjects = () => navigate("/create");

  // Render appropriate UI state
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={handleRetry} />;
  if (!project) return <NotFoundState onBackToProjects={handleBackToProjects} />;
  if (!members) return <NotFoundState onBackToProjects={handleBackToProjects} />;

  return <ProjectView project={project} members={members} />;
};

export default ProjectPage;
