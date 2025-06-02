import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { useGamificationToasts } from "./useGamificationToasts";
import { useAuth } from "@/contexts/AuthContext";

interface UpdateBacklogItemParams {
  projectId: string;
  itemId: string;
  itemType: string;
  updateData: any;
}

export const useBacklogItemUpdate = () => {
  const queryClient = useQueryClient();
  const { showGamificationToast } = useGamificationToasts();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      projectId,
      itemId,
      itemType,
      updateData,
    }: UpdateBacklogItemParams) => {
      const response = await apiClient.put(
        `/projects/${projectId}/backlog/items/${itemId}/?type=${itemType}`,
        updateData
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Show gamification toasts if user completed the task and got points
      if (
        data.toast &&
        variables.updateData.status === "done" &&
        data.toast.points > 0
      ) {
        // Only show toast if current user is the assignee
        if (data.assigneeId === user?.userId) {
          showGamificationToast(data.toast);
        }
      }

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["backlog", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-stats", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-activity", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-leaderboard", variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-profile-with-gamification"],
      });
    },
    onError: (error) => {
      console.error("Error updating backlog item:", error);
      // You could show an error toast here if needed
    },
  });
};
