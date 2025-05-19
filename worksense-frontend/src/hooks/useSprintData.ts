import { useQuery } from "@tanstack/react-query";
import { sprintService } from "@/services/sprintService";
import { Sprint } from "@/types/SprintType"

export function useSprints(projectId: string) {
  return useQuery<Sprint[], Error>({
    queryKey: ["sprints", projectId],
    queryFn: () => sprintService.getAllSprintsForProject(projectId),
    enabled: !!projectId,
  });
}
