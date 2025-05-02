import React, { useMemo } from 'react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  startDate: string | null;
  endDate: string | null;
  assignees: Array<{
    id: string;
    name: string;
    avatarUrl: string;
  }>;
}

interface TimelineViewProps {
  columns: Array<{
    id: string;
    title: string;
    tasks: Task[];
  }>;
}

const TimelineView: React.FC<TimelineViewProps> = ({ columns }) => {
  // Get all tasks with dates
  const tasksWithDates = useMemo(() => {
    return columns
      .reduce<Task[]>((acc, column) => {
        return [...acc, ...column.tasks.filter(task => 
          task.title !== null && (task.startDate || task.endDate)
        )];
      }, [])
      .sort((a, b) => {
        const dateA = a.startDate || a.endDate || '';
        const dateB = b.startDate || b.endDate || '';
        return dateA.localeCompare(dateB);
      });
  }, [columns]);

  // Calculate timeline range
  const timelineRange = useMemo(() => {
    const dates = tasksWithDates.reduce<string[]>((acc, task) => {
      if (task.startDate) acc.push(task.startDate);
      if (task.endDate) acc.push(task.endDate);
      return acc;
    }, []);

    if (dates.length === 0) return null;

    const minDate = new Date(Math.min(...dates.map(d => new Date(d).getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => new Date(d).getTime())));
    
    // Add padding days
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    return { start: minDate, end: maxDate };
  }, [tasksWithDates]);

  if (!timelineRange) {
    return (
      <div className="timeline-view-container p-6">
        <div className="text-center text-gray-500">No tasks with dates found</div>
      </div>
    );
  }

  const totalDays = Math.ceil((timelineRange.end.getTime() - timelineRange.start.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="timeline-view-container p-6">
      <div className="bg-white rounded-lg shadow p-6">
        {/* Timeline Header */}
        <div className="flex border-b mb-4">
          <div className="w-1/4" /> {/* Task info space */}
          <div className="flex-1 flex">
            {Array.from({ length: totalDays }, (_, i) => {
              const date = new Date(timelineRange.start);
              date.setDate(date.getDate() + i);
              const isFirstOfMonth = date.getDate() === 1;
              const isMonday = date.getDay() === 1;
              
              return (
                <div 
                  key={i}
                  className={`flex-1 text-xs text-center ${
                    isFirstOfMonth ? 'font-bold' : ''
                  }`}
                >
                  {isFirstOfMonth && (
                    <div className="text-gray-600">
                      {date.toLocaleString('default', { month: 'short' })}
                    </div>
                  )}
                  {isMonday && (
                    <div className="text-gray-400">
                      {date.getDate()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          {tasksWithDates.map(task => {
            const startDate = task.startDate ? new Date(task.startDate) : timelineRange.start;
            const endDate = task.endDate ? new Date(task.endDate) : new Date(startDate);
            
            const startOffset = Math.max(0, Math.floor(
              (startDate.getTime() - timelineRange.start.getTime()) / (1000 * 60 * 60 * 24)
            ));
            const duration = Math.ceil(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;

            return (
              <div key={task.id} className="flex items-center">
                {/* Task Info */}
                <div className="w-1/4 pr-4">
                  <div className="text-sm font-medium text-gray-900">{task.title}</div>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`px-2 text-xs font-semibold rounded-full ${
                      task.status === 'Started' ? 'bg-green-100 text-green-800' :
                      task.status === 'Not started' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                    {task.priority && (
                      <span className={`px-2 text-xs font-semibold rounded-full ${
                        task.priority === 'P1' ? 'bg-red-100 text-red-800' :
                        task.priority === 'P2' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>

                {/* Timeline Bar */}
                <div className="flex-1 flex">
                  <div style={{ marginLeft: `${(startOffset / totalDays) * 100}%` }}>
                    <div 
                      className={`h-6 rounded ${
                        task.status === 'Started' ? 'bg-blue-500' :
                        task.status === 'Not started' ? 'bg-gray-300' :
                        'bg-green-500'
                      }`}
                      style={{ 
                        width: `${(duration / totalDays) * 100}%`,
                        minWidth: '20px'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineView; 