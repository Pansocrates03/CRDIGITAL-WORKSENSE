import React from 'react';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';
import MemberDetailed from '@/types/MemberDetailedType';
import { useParams } from 'react-router-dom';
import { Ticket } from '@/types/TicketType';
import { useMembers } from '@/hooks/useMembers';

const renderAsignee = (memmberId:string|null|undefined, members:MemberDetailed[]) => {

  let assignee = members?.find(member => member.userId == memmberId)
  if(!assignee) return

  return (
    <AvatarDisplay
      user={assignee.user}
      className="h-6 w-6 rounded-full ring-2 ring-white"
    />
  )
}

const TableView: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  const { id: projectId } = useParams<{ id: string }>();
  if(!projectId) throw new Error("There is no project ID");

  const { data:membersData=[], } = useMembers(projectId)
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ticket
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
          {tickets.map(ticket => (
            <tr key={ticket.id} className="hover:bg-gray-50">
            
              {/* NAME */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{ticket.name}</div>
              </td>

              {/* STATUS */}
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  ticket.status === 'sprint_backlog' ? 'bg-yellow-100 text-yellow-800' :
                  ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  ticket.status === 'in_review' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticket.status.length <= 0 ? "Sprint Backlog" : ticket.status}
                </span>
              </td>

              {/* PRIORITY */}
              <td className="px-6 py-4 whitespace-nowrap">
                {ticket.priority && (
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.priority}
                  </span>
                )}
              </td>

              {/* Asignee */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex -space-x-2">
                  {ticket.assignedTo && renderAsignee(ticket.assignedTo, membersData )}
                </div>
              </td>

              {/* PROGRESS BAR */}
              <td className="px-6 py-4 whitespace-nowrap">
                {30 > 0 && ( // {task.subtasksTotal > 0 && (
                  <div className="w-32">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(2 / ticket.tasks.length) * 100}%` }} // style={{ width: `${(task.subtasksCompleted / task.subtasksTotal) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {ticket.tasks.filter(t => t.isFinished == true).length}/{ticket.tasks.length} {/*  {task.subtasksCompleted}/{task.subtasksTotal} */}
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