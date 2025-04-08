import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectView, ProjectViewData } from '../../components/ProjectView/ProjectView';
import { projectService } from '../../services/projectService';
import { SideBar } from '../../components/SideBar/SideBar';

export const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) throw new Error('Project ID is required');
        const projectData = await projectService.getProject(id);
        const membersData = await projectService.getProjectMembers(id);
        
        // Transform members data to match the expected format
        const teamMembers = membersData.map(member => ({
          id: member.userId,
          name: member.name || 'Unknown User',
          avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'Unknown')}&background=random`
        }));

        // Transform the data to match the ProjectView component's expected format
        const transformedProject: ProjectViewData = {
          id: projectData.id || id,
          title: projectData.name || 'Untitled Project',
          company: 'Softtek Company',
          location: 'Monterrey, MX',
          description: projectData.description || 'No description available',
          currentSprint: {
            number: 1,
            startDate: 'Mar 15, 2024',
            endDate: 'Mar 29, 2024'
          },
          tasks: {
            todo: 0,
            inProgress: 0,
            completed: 0
          },
          progress: {
            webDashboard: 75,
            database: 45
          },
          team: teamMembers
        };

        // Calculate task counts from items instead of epics
        if (projectData.items && Array.isArray(projectData.items)) {
          const taskCounts = projectData.items.reduce((acc, item) => {
            // Count main items
            if (item.status === 'TODO' || item.status === 'BACKLOG') acc.todo++;
            else if (item.status === 'IN_PROGRESS') acc.inProgress++;
            else if (item.status === 'COMPLETED' || item.status === 'DONE') acc.completed++;

            // Count sub-items if they exist
            if (item.items && Array.isArray(item.items)) {
              item.items.forEach(subItem => {
                if (subItem.status === 'TODO' || subItem.status === 'BACKLOG') acc.todo++;
                else if (subItem.status === 'IN_PROGRESS') acc.inProgress++;
                else if (subItem.status === 'COMPLETED' || subItem.status === 'DONE') acc.completed++;
              });
            }

            return acc;
          }, { todo: 0, inProgress: 0, completed: 0 });

          transformedProject.tasks = taskCounts;

          // Calculate progress based on task completion
          const totalTasks = taskCounts.todo + taskCounts.inProgress + taskCounts.completed;
          if (totalTasks > 0) {
            const completionRate = (taskCounts.completed / totalTasks) * 100;
            transformedProject.progress = {
              webDashboard: Math.round(completionRate),
              database: Math.round(completionRate * 0.8)
            };
          }
        }

        setProject(transformedProject);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch project');
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--color-background, #f5f5f5)'
      }}>
        <SideBar />
        <div style={{ 
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '1.5rem',
          padding: '2rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid var(--color-light-gray, #f5f5f5)',
            borderTopColor: 'var(--color-purple, #AC1754)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <p style={{ 
              color: 'var(--color-charcoal, #253C4F)',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>Loading project...</p>
            <p style={{
              color: 'var(--color-gray-dark, #666)',
              fontSize: '0.9rem'
            }}>Please wait while we fetch your project data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--color-background, #f5f5f5)'
      }}>
        <SideBar />
        <div style={{ 
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: 'var(--color-pink-light)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              fontSize: '2rem',
              color: 'var(--color-purple)'
            }}>!</span>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              color: 'var(--color-charcoal)',
              fontSize: '1.5rem',
              margin: '0'
            }}>Something went wrong</h2>
            <p style={{
              color: 'var(--color-gray-dark)',
              fontSize: '1rem',
              maxWidth: '400px'
            }}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--color-purple)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ 
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--color-background, #f5f5f5)'
      }}>
        <SideBar />
        <div style={{ 
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: 'var(--color-pink-light)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              fontSize: '2rem',
              color: 'var(--color-purple)'
            }}>?</span>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              color: 'var(--color-charcoal)',
              fontSize: '1.5rem',
              margin: '0'
            }}>Project Not Found</h2>
            <p style={{
              color: 'var(--color-gray-dark)',
              fontSize: '1rem',
              maxWidth: '400px'
            }}>The project you're looking for doesn't exist or you don't have access to it.</p>
            <button 
              onClick={() => window.location.href = '/create'}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--color-purple)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex',
      height: '100vh',
      backgroundColor: 'var(--color-background, #f5f5f5)'
    }}>
      <SideBar />
      <div style={{ flex: 1 }}>
        <ProjectView project={project} />
      </div>
    </div>
  );
}; 