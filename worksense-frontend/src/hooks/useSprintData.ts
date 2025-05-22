import { useQuery, useQueryClient, useMutation} from "@tanstack/react-query";
import { sprintService } from "@/services/sprintService";
import { Sprint } from "@/types/SprintType"

export function useSprints(projectId: string) {
  return useQuery<Sprint[], Error>({
    queryKey: ["sprints", projectId],
    queryFn: () => sprintService.getAllSprintsForProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreateSprint(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintData: Omit<Sprint, "id" | "projectId" | "createdAt" | "updatedAt">) =>
      sprintService.createSprint(projectId, sprintData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
    },
  });
}

export function useUpdateSprint(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintData: { id: string } & Partial<Omit<Sprint, "id" | "projectId" | "createdAt" | "updatedAt">>) =>
      sprintService.updateSprint(projectId, sprintData.id, sprintData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
    },
  });
}

export function useDeleteSprint(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sprintId: string) => sprintService.deleteSprint(projectId, sprintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] });
    },
  });
}
