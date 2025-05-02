import React from 'react';

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

interface OverviewViewProps {
  columns: Array<{
    id: string;
    title: string;
    tasks: Task[];
  }>;
}

const OverviewView: React.FC<OverviewViewProps> = ({ columns }) => {
  // Calculate summary statistics
  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0);
  const completedTasks = columns.find(col => col.id === 'col-done')?.tasks.length || 0;
  const inProgressTasks = columns.reduce((acc, col) => {
    return acc + col.tasks.filter((task: Task) => task.status === 'Started').length;
  }, 0);
  const notStartedTasks = columns.reduce((acc, col) => {
    return acc + col.tasks.filter((task: Task) => task.status === 'Not started').length;
  }, 0);

  return (
    <div className="overview-container p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Tasks</h3>
          <p className="text-3xl font-bold" style={{ color: '#AC1754' }}>{totalTasks}</p>
        </div>

        {/* Completed Tasks Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
          <p className="text-3xl font-bold" style={{ color: '#AC1754' }}>{completedTasks}</p>
        </div>

        {/* In Progress Tasks Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
          <p className="text-3xl font-bold" style={{ color: '#AC1754' }}>{inProgressTasks}</p>
        </div>

        {/* Not Started Tasks Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Not Started</h3>
          <p className="text-3xl font-bold" style={{ color: '#AC1754' }}>{notStartedTasks}</p>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Tasks by Priority</h3>
        <div className="space-y-4">
          {['P1', 'P2', 'P3'].map(priority => {
            const count = columns.reduce((acc, col) => {
              return acc + col.tasks.filter((task: Task) => task.priority === priority).length;
            }, 0);
            
            return (
              <div key={priority} className="flex items-center">
                <span className="w-16 text-gray-600">{priority}</span>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${(count / totalTasks) * 100}%`,
                      backgroundColor: priority === 'P1' ? '#AC1754' : 
                                     priority === 'P2' ? '#D14B80' : 
                                     '#F47EAC'
                    }}
                  />
                </div>
                <span className="ml-4 w-16 text-right text-gray-600">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OverviewView; 