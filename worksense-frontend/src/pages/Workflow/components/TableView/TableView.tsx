import React from "react";
import BacklogItemType from "@/types/BacklogItemType";
import { AvatarDisplay } from "@/components/ui/AvatarDisplay";
import { projectService } from "@/services/projectService";
import MemberDetailed from "@/types/MemberDetailedType";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { QueryKeys } from "@/lib/constants/queryKeys";
import { format, isValid } from "date-fns";
import StatusBadge from "@/components/BacklogTable/StatusBadge";

interface TableViewProps {
  tasks: BacklogItemType[];
}

const renderAsignee = (memmberId: number | null | undefined) => {
  const { id: projectId } = useParams<{ id: string }>();
  if (!projectId) throw new Error("There is no project ID");
  // Find member
  const { isLoading, data, error } = useQuery<MemberDetailed[]>({
    queryKey: [QueryKeys.members, projectId],
    queryFn: () => projectService.fetchProjectMembersDetailed(projectId),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>An error ocurred</div>;
  }

  console.log("Members Data", data);
  let assignee = data?.find((member) => member.userId == memmberId);
  if (!assignee) throw new Error("Asignee not found");

  return (
    <AvatarDisplay
      user={assignee}
      className="h-6 w-6 rounded-full ring-2 ring-white"
    />
  );
};

// Helper function to safely format date
const formatDate = (dateValue: any): string => {
  if (!dateValue) return "-";
  try {
    // Firestore timestamp con _seconds
    if (typeof dateValue === "object" && "_seconds" in dateValue) {
      const date = new Date(dateValue._seconds * 1000);
      return isValid(date) ? format(date, "yyyy-MM-dd") : "-";
    }
    // Firestore timestamp con seconds (por si acaso)
    if (typeof dateValue === "object" && "seconds" in dateValue) {
      const date = new Date(dateValue.seconds * 1000);
      return isValid(date) ? format(date, "yyyy-MM-dd") : "-";
    }
    // ISO string o timestamp
    const date = new Date(dateValue);
    return isValid(date) ? format(date, "yyyy-MM-dd") : "-";
  } catch (error) {
    console.error("Error formatting date:", error, dateValue);
    return "-";
  }
};

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
              Last Update
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => {
            return (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {task.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    type="status"
                    value={task.status || "Unassigned"}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {task.priority && (
                    <StatusBadge type="priority" value={task.priority} />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex -space-x-2">
                    {task.assigneeId && renderAsignee(task.assigneeId)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(task.updatedAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;
