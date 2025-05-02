import React from 'react';
import { Task } from '../../data';

interface ListViewProps {
  tasks: Task[];
}

const ListView: React.FC<ListViewProps> = ({ tasks }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="grid grid-cols-6 gap-4 font-semibold text-gray-600">
          <div>Task</div>
          <div>Status</div>
          <div>Priority</div>
          <div>Assignees</div>
          <div>Progress</div>
          <div>Due Date</div>
        </div>
      </div>
      <div className="divide-y">
        {tasks.map(task => (
          <div key={task.id} className="p-4 hover:bg-gray-50">
            <div className="grid grid-cols-6 gap-4 items-center">
              <div className="font-medium">{task.title}</div>
              <div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  task.status === 'sprint_backlog' ? 'bg-yellow-100 text-yellow-800' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'in_review' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                {task.priority && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    task.priority === 'P1' ? 'bg-red-100 text-red-800' :
                    task.priority === 'P2' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                )}
              </div>
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
              <div>
                {task.subtasksTotal > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(task.subtasksCompleted / task.subtasksTotal) * 100}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'No due date'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListView; 