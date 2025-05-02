import React from 'react';
import { Task } from '../../data';

interface OverviewViewProps {
  tasks: Task[];
}

const OverviewView: React.FC<OverviewViewProps> = ({ tasks }) => {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Task Status</h3>
        <div className="space-y-4">
          {['sprint_backlog', 'in_progress', 'in_review', 'done'].map(status => (
            <div key={status} className="flex justify-between items-center">
              <span className="text-gray-600">{status.replace('_', ' ')}</span>
              <span className="font-semibold">
                {tasks.filter(task => task.status === status).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
        <div className="space-y-4">
          {['P1', 'P2', 'P3'].map(priority => (
            <div key={priority} className="flex justify-between items-center">
              <span className="text-gray-600">{priority}</span>
              <span className="font-semibold">
                {tasks.filter(task => task.priority === priority).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Completion Rate</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Tasks</span>
            <span className="font-semibold">{tasks.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Completed Tasks</span>
            <span className="font-semibold">
              {tasks.filter(task => task.status === 'done').length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Completion Rate</span>
            <span className="font-semibold">
              {Math.round(
                (tasks.filter(task => task.status === 'done').length / tasks.length) * 100
              )}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView; 