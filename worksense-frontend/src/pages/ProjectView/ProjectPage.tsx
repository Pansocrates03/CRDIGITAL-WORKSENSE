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
        
        // Test team members with real avatars
        const testTeam = [
          {
            id: '1',
            name: 'John Smith',
            avatar: 'https://i.pravatar.cc/150?img=1'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            avatar: 'https://i.pravatar.cc/150?img=5'
          },
          {
            id: '3',
            name: 'Mike Wilson',
            avatar: 'https://i.pravatar.cc/150?img=3'
          },
          {
            id: '4',
            name: 'Emily Brown',
            avatar: 'https://i.pravatar.cc/150?img=9'
          }
        ];

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
            webDashboard: 75, // Test progress for web dashboard
            database: 45      // Test progress for database
          },
          team: testTeam // Use our test team data
        };

        // Safely calculate task counts if epics exist
        if (projectData.epics && Array.isArray(projectData.epics)) {
          const taskCounts = projectData.epics.reduce((acc, epic) => {
            if (!epic.stories || !Array.isArray(epic.stories)) return acc;

            const storyCounts = epic.stories.reduce((storyAcc, story) => {
              if (!story.tasks || !Array.isArray(story.tasks)) return storyAcc;

              const todoCount = story.tasks.filter(task => task.status === 'TODO').length;
              const inProgressCount = story.tasks.filter(task => task.status === 'IN_PROGRESS').length;
              const completedCount = story.tasks.filter(task => task.status === 'COMPLETED').length;

              return {
                todo: storyAcc.todo + todoCount,
                inProgress: storyAcc.inProgress + inProgressCount,
                completed: storyAcc.completed + completedCount
              };
            }, { todo: 0, inProgress: 0, completed: 0 });

            return {
              todo: acc.todo + storyCounts.todo,
              inProgress: acc.inProgress + storyCounts.inProgress,
              completed: acc.completed + storyCounts.completed
            };
          }, { todo: 0, inProgress: 0, completed: 0 });

          transformedProject.tasks = taskCounts;

          // Only update progress if we don't have our test values
          if (projectData.progress === undefined) {
            const totalTasks = taskCounts.todo + taskCounts.inProgress + taskCounts.completed;
            if (totalTasks > 0) {
              const completionRate = (taskCounts.completed / totalTasks) * 100;
              transformedProject.progress = {
                webDashboard: Math.round(completionRate),
                database: Math.round(completionRate * 0.8)
              };
            }
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
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-light-gray, #f5f5f5)',
            borderTopColor: 'var(--color-purple, #AC1754)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: 'var(--color-charcoal, #253C4F)' }}>Loading project...</p>
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
          color: 'var(--color-charcoal, #253C4F)'
        }}>
          Error: {error}
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
          color: 'var(--color-charcoal, #253C4F)'
        }}>
          Project not found
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