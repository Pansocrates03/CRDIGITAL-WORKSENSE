import React, { useState, useMemo } from 'react';

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
  commentsCount: number;
  linksCount: number;
  subtasksTotal: number;
  subtasksCompleted: number;
}

interface TableViewProps {
  columns: Array<{
    id: string;
    title: string;
    tasks: Task[];
  }>;
}

type SortField = 'title' | 'status' | 'priority' | 'startDate' | 'endDate' | 'progress';
type SortDirection = 'asc' | 'desc';

const TableView: React.FC<TableViewProps> = ({ columns }) => {
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Flatten and prepare all tasks
  const allTasks = useMemo(() => {
    return columns.reduce<Task[]>((acc, column) => {
      return [...acc, ...column.tasks.filter(task => task.title !== null)];
    }, []);
  }, [columns]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    return [...allTasks].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'priority':
          comparison = (a.priority || 'Z').localeCompare(b.priority || 'Z');
          break;
        case 'startDate':
          comparison = (a.startDate || '').localeCompare(b.startDate || '');
          break;
        case 'endDate':
          comparison = (a.endDate || '').localeCompare(b.endDate || '');
          break;
        case 'progress':
          const progressA = a.subtasksTotal ? (a.subtasksCompleted / a.subtasksTotal) : 0;
          const progressB = b.subtasksTotal ? (b.subtasksCompleted / b.subtasksTotal) : 0;
          comparison = progressA - progressB;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [allTasks, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return <span className="ml-1">↕</span>;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="table-view-container p-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  Task <SortIcon field="title" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Status <SortIcon field="status" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('priority')}
                >
                  Priority <SortIcon field="priority" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('startDate')}
                >
                  Start Date <SortIcon field="startDate" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('endDate')}
                >
                  End Date <SortIcon field="endDate" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('progress')}
                >
                  Progress <SortIcon field="progress" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTasks.map(task => (
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
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ 
                          width: `${task.subtasksTotal ? 
                            (task.subtasksCompleted / task.subtasksTotal) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {task.subtasksCompleted}/{task.subtasksTotal}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span title="Comments">💬 {task.commentsCount}</span>
                      <span title="Links">🔗 {task.linksCount}</span>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableView; 