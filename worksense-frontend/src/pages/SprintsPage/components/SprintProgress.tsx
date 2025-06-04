import React from 'react';
import { useSprintTasks } from "@/hooks/useSprintTasks";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";

interface SprintProgressProps {
    projectId: string;
    sprintId: string;
}

const SprintProgress: React.FC<SprintProgressProps> = ({ projectId, sprintId }) => {
    const { stats, isLoading: taskStatsLoading } = useSprintTasks({
        projectId,
        sprintId,
    });

    return (
        <>
            <AnimatedCircularProgressBar
                max={100}
                min={0}
                value={taskStatsLoading ? 0 : stats.completionPercentage}
                gaugePrimaryColor="var(--accent-pink)"
                gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
            />
            {!taskStatsLoading && (
                <div className="text-sm text-gray-600 mt-2">
                    {stats.completedTasks} of {stats.totalTasks} User Stories Completed
                </div>
            )}
        </>
    );
};

export default SprintProgress; 