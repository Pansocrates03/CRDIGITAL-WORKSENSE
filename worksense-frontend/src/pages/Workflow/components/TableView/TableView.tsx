import React from 'react';
import { Task } from '../../data';
import BacklogItemType from '@/types/BacklogItemType';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';
import { projectService } from '@/services/projectService';
import MemberDetailed from '@/types/MemberDetailedType';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { QueryKeys } from '@/lib/constants/queryKeys';

interface TableViewProps {
  tasks: BacklogItemType[];
}

const renderAsignee = (memmberId:number|null|undefined) => {
  const { id: projectId } = useParams<{ id: string }>();
  if(!projectId) throw new Error("There is no project ID");
  // Find member
  const { isLoading, data, error } = useQuery<MemberDetailed[]>({
    queryKey: [QueryKeys.members, projectId],
    queryFn: () => projectService.fetchProjectMembersDetailed(projectId)
  })

  if(isLoading){ return <div>Loading...</div> }
  if(error){ return <div>An error ocurred</div> }

  console.log("Members Data", data)
  let assignee = data?.find(member => member.userId == memmberId)
  if(!assignee) throw new Error("Asignee not found")

  return (
    <AvatarDisplay
      user={assignee}
      className="h-6 w-6 rounded-full ring-2 ring-white"
    />
  )
}

const TableView: React.FC<TableViewProps> = ({ tasks }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assignees
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Comments
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Links
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map(task => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{task.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  task.status === 'sprint_backlog' ? 'bg-yellow-100 text-yellow-800' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'in_review' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.status?.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {task.priority && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex -space-x-2">
                  {task.assigneeId && renderAsignee(task.assigneeId)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {30 > 0 && ( // {task.subtasksTotal > 0 && (
                  <div className="w-32">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(10 / 30) * 100}%` }} // style={{ width: `${(task.subtasksCompleted / task.subtasksTotal) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {10}/{30} {/*  {task.subtasksCompleted}/{task.subtasksTotal} */}
                    </span>
                  </div>
                )}
              </td>
              {/* 
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {task.startDate ? new Date(task.startDate).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {task.endDate ? new Date(task.endDate).toLocaleDateString() : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {task.commentsCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {task.linksCount}
              </td>
              */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableView; 