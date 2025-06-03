import { useQuery } from "@tanstack/react-query";
import { sprintService } from "@/services/sprintService";
import { ApiResponseTask } from "@/types/SprintType";

interface UseSprintTasksParams {
  projectId: string;
  sprintId: string;
  enabled?: boolean;
}

interface SprintTasksStats {
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

export const useSprintTasks = ({ projectId, sprintId, enabled = true }: UseSprintTasksParams) => {
  const query = useQuery({
    queryKey: ["sprint-tasks", projectId, sprintId],
    queryFn: () => sprintService.getSprintTasks(projectId, sprintId),
    enabled: enabled && !!projectId && !!sprintId,
  });

  const stats: SprintTasksStats = {
    totalTasks: 0,
    completedTasks: 0,
    completionPercentage: 0,
  };

  if (query.data) {
    stats.totalTasks = query.data.length;
    stats.completedTasks = query.data.filter(task => task.status === "Done").length;
    stats.completionPercentage = stats.totalTasks > 0 
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;
  }

  return {
    ...query,
    stats,
  };
}; 