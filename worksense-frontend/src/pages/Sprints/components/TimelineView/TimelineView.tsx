import React from 'react';
import { Task } from '../../data';

interface TimelineViewProps {
  tasks: Task[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ tasks }) => {
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return dateA - dateB;
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        {sortedTasks.map((task, index) => (
          <div key={task.id} className="relative pl-12 pb-8">
            <div className="absolute left-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {index + 1}
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  task.status === 'sprint_backlog' ? 'bg-yellow-100 text-yellow-800' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'in_review' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                <div>
                  <span className="font-medium">Start:</span>{' '}
                  {task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Not set'}
                </div>
                <div>
                  <span className="font-medium">Due:</span>{' '}
                  {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'Not set'}
                </div>
                {task.priority && (
                  <div>
                    <span className="font-medium">Priority:</span>{' '}
                    <span className={`px-1 py-0.5 text-xs font-semibold rounded-full ${
                      task.priority === 'P1' ? 'bg-red-100 text-red-800' :
                      task.priority === 'P2' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {task.assignees.map(assignee => (
                    <img
                      key={assignee.id}
                      className="h-6 w-6 rounded-full ring-2 ring-white"
                      src={assignee.avatarUrl}
                      alt={assignee.name}
                      title={assignee.name}
                    />
                  ))}
                </div>
                {task.subtasksTotal > 0 && (
                  <div className="w-32">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(task.subtasksCompleted / task.subtasksTotal) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {task.subtasksCompleted}/{task.subtasksTotal}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView; 