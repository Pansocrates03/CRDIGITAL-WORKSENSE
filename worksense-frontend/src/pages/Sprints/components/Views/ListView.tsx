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

interface ListViewProps {
  columns: Array<{
    id: string;
    title: string;
    tasks: Task[];
  }>;
}

const ListView: React.FC<ListViewProps> = ({ columns }) => {
  // Flatten all tasks from all columns into a single array
  const allTasks = columns.reduce<Task[]>((acc, column) => {
    return [...acc, ...column.tasks.filter(task => task.title !== null)];
  }, []);

  return (
    <div className="list-view-container p-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignees</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allTasks.map(task => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{task.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    task.status === 'Started' ? 'bg-green-100 text-green-800' :
                    task.status === 'Not started' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {task.priority && (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      task.priority === 'P1' ? 'bg-red-100 text-red-800' :
                      task.priority === 'P2' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.startDate || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.endDate || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex -space-x-2">
                    {task.assignees.map(assignee => (
                      <img
                        key={assignee.id}
                        className="h-8 w-8 rounded-full ring-2 ring-white"
                        src={assignee.avatarUrl}
                        alt={assignee.name}
                        title={assignee.name}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView; 