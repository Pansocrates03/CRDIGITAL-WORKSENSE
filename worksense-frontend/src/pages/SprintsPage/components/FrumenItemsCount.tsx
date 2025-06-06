import React from 'react';
import { useFrumen } from '@/hooks/useFrumen';
import { useMembers } from '@/hooks/useMembers';

// Props interface for the component
interface FrumenItemsCountProps {
    projectId: string;
    sprintId: string;
}

interface FrumenItem {
    assigneeId?: string;
}

interface Member {
    userId: number;
    name: string;
}

const FrumenItemsCount: React.FC<FrumenItemsCountProps> = ({ projectId, sprintId }) => {
    // Fetch all items in the sprint using the frumen hook
    const { data: frumenItems } = useFrumen(projectId, sprintId);
    // Fetch all project members to get their names
    const { data: members = [] } = useMembers(projectId);

    // Count tasks by assignee
    const assigneeCounts = frumenItems?.reduce((acc: { [key: string]: number }, item: FrumenItem) => {
        // Only count items that have an assignee
        if (item.assigneeId) {
            acc[item.assigneeId] = (acc[item.assigneeId] || 0) + 1;
        }
        return acc;
    }, {}) || {};  // If frumenItems is undefined, return empty object

    return (
        <div className="sprint-details__section">            
            <h4>Tasks by Assignee</h4>
            <ul>
                {/* Convert the counts object into an array of [assigneeId, count] pairs and map over them */}
                {Object.entries(assigneeCounts).map(([assigneeId, count]) => {
                    // Find member by userId (convert assigneeId to number since userId is number)
                    const member = members.find(m => m.userId === Number(assigneeId));
                    // Display member name if found, otherwise show the ID
                    return (
                        <li key={assigneeId}>
                            {member?.name || `User ${assigneeId}`}: {count} tasks
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default FrumenItemsCount; 