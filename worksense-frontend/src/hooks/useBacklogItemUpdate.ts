import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import { useGamificationToasts } from "./useGamificationToasts";
import { useAuth } from "@/contexts/AuthContext";

interface UpdateBacklogItemParams {
  projectId: string;
  itemId: string;
  itemType: string;
  updateData: any;
  parentId?: string | null;
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
      parentId,
    }: UpdateBacklogItemParams) => {
      console.log("Updating backlog item:", {
        projectId,
        itemId,
        itemType,
        updateData,
        parentId,
        currentUser: user?.userId,
      });

      let response;
      if (parentId) {
        // Subitem update
        response = await apiClient.put(
          `/projects/${projectId}/backlog/items/${parentId}/subitems/${itemId}`,
          updateData
        );
      } else {
        // Regular item update
        response = await apiClient.put(
          `/projects/${projectId}/backlog/items/${itemId}/?type=${itemType}`,
          updateData
        );
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log("Backlog item update response:", {
        hasToast: !!data.toast,
        toastData: data.toast,
        status: variables.updateData.status,
        points: data.toast?.points,
        assigneeId: data.assigneeId,
        currentUserId: user?.userId,
        projectId: variables.projectId,
      });

      // Show gamification toasts if user completed the task and got points
      if (
        data.toast &&
        typeof data.toast.points === 'number' &&
        data.toast.points !== 0
      ) {
        // Convert both to numbers for comparison
        const assigneeId = Number(data.assigneeId);
        const currentUserId = Number(user?.userId);

        console.log("Comparing user IDs:", {
          assigneeId,
          currentUserId,
          originalAssigneeId: data.assigneeId,
          originalCurrentUserId: user?.userId,
        });

        // Only show toast if current user is the assignee
        if (assigneeId === currentUserId) {
          console.log("Showing gamification toast for:", {
            projectId: variables.projectId,
            points: data.toast.points,
            assigneeId,
            currentUserId,
          });
          showGamificationToast({
            ...data.toast,
            type: 'success',
            newBadges: data.toast.newBadges ?? [],
            totalPoints: data.toast.totalPoints ?? 0,
            level: data.toast.level ?? 1,
          });
        } else {
          console.log("Toast not shown - user mismatch:", {
            assigneeId,
            currentUserId,
          });
        }
      } else {
        console.log("Toast conditions not met:", {
          hasToast: !!data.toast,
          status: variables.updateData.status,
          points: data.toast?.points,
        });
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
