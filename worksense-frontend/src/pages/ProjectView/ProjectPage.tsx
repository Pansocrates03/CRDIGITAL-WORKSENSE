import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectView, ProjectViewData } from '../../components/ProjectView/ProjectView';
import { projectService, Project } from '../../services/projectService';
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
        
        // Transform the data to match the ProjectView component's expected format
        const transformedProject: ProjectViewData = {
          id: projectData.id,
          title: projectData.name,
          company: 'Softtek Company', // You might want to add this to your backend
          location: 'Monterrey, MX', // You might want to add this to your backend
          description: projectData.description,
          currentSprint: {
            number: 3, // You might want to add sprint info to your backend
            startDate: 'March 1st',
            endDate: 'March 14th'
          },
          tasks: {
            todo: projectData.epics.reduce((acc, epic) => 
              acc + epic.stories.reduce((acc2, story) => 
                acc2 + story.tasks.filter(task => task.status === 'TODO').length, 0), 0),
            inProgress: projectData.epics.reduce((acc, epic) => 
              acc + epic.stories.reduce((acc2, story) => 
                acc2 + story.tasks.filter(task => task.status === 'IN_PROGRESS').length, 0), 0),
            completed: projectData.epics.reduce((acc, epic) => 
              acc + epic.stories.reduce((acc2, story) => 
                acc2 + story.tasks.filter(task => task.status === 'COMPLETED').length, 0), 0)
          },
          progress: {
            webDashboard: 95, // You might want to calculate this based on completed tasks
            database: 15
          },
          team: projectData.members.map(member => ({
            id: member.id,
            name: member.name || 'Team Member',
            avatar: member.avatar || `https://i.pravatar.cc/150?u=${member.id}` // Fallback avatar
          }))
        };

        setProject(transformedProject);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch project');
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
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