// src/hooks/useSprintData.ts (Example file name)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sprintService } from "../services/sprintService"; // Adjust path
import { taskService } from "../services/taskService"; // Adjust path - Create this service if needed
import { ApiResponseTask } from "../types/TaskType"; // Adjust path
import { Sprint } from "../types/SprintType"; // Adjust path

// --- Query Key Factory --- (Good practice for consistency)
export const sprintQueryKeys = {
  all: (projectId: string) => ["sprints", projectId] as const, // For list of sprints
  detail: (projectId: string, sprintId: string) =>
    ["sprints", projectId, "detail", sprintId] as const, // For single sprint details
  tasks: (projectId: string, sprintId: string) =>
    ["sprints", projectId, "tasks", sprintId] as const, // For tasks within a sprint
};

// --- Hook to Fetch Tasks for a Specific Sprint ---
export function useSprintTasks(projectId?: string, sprintId?: string) {
  return useQuery<ApiResponseTask[], Error>({
    // Use the query key factory
    queryKey: sprintQueryKeys.tasks(projectId!, sprintId!), // Non-null assertion ok due to 'enabled'

    queryFn: () => {
      // Service function expects non-null IDs
      if (!projectId || !sprintId) {
        return Promise.reject(
          new Error("Project ID or Sprint ID is required.")
        ); // Should not happen if 'enabled' is correct
      }
      return sprintService.getSprintTasks(projectId, sprintId);
    },

    // Only enable the query if both IDs are present and valid strings
    enabled:
      !!projectId &&
      !!sprintId &&
      typeof projectId === "string" &&
      typeof sprintId === "string",

    // Optional: Add default staleTime, etc. if desired for this specific query
    // staleTime: 1000 * 60 * 1, // e.g., tasks data becomes stale after 1 minute
  });
}

// --- Hook to Fetch Details for a Specific Sprint ---
export function useSprintDetails(projectId?: string, sprintId?: string) {
  return useQuery<Sprint, Error>({
    queryKey: sprintQueryKeys.detail(projectId!, sprintId!),
    queryFn: () => {
      if (!projectId || !sprintId) {
        return Promise.reject(
          new Error("Project ID or Sprint ID is required.")
        );
      }
      return sprintService.getSprintDetails(projectId, sprintId);
    },
    enabled: !!projectId && !!sprintId,
  });
}

// --- Hook to Update Task Status (Example for Drag-and-Drop) ---
// Assume taskService.updateTaskStatus exists and takes: (projectId, taskId, { status, order })
export function useUpdateTaskStatus(projectId?: string, sprintId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    // Define the mutation function's expected input type
    mutationFn: (variables: {
      taskId: string | number;
      status: string;
      order: number;
    }) => {
      if (!projectId) {
        throw new Error("Project ID is required for updating task status.");
      }
      // Assume your taskService handles the actual PATCH/PUT request
      return taskService.updateTaskStatus(projectId, variables.taskId, {
        status: variables.status,
        order: variables.order,
      });
    },

    // Optimistic Update Example (similar to before)
    onMutate: async (updatedTaskInfo) => {
      if (!projectId || !sprintId) return; // Guard if IDs aren't ready

      const queryKey = sprintQueryKeys.tasks(projectId, sprintId);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousTasks =
        queryClient.getQueryData<ApiResponseTask[]>(queryKey);

      // Optimistically update to the new value
      if (previousTasks) {
        queryClient.setQueryData<ApiResponseTask[]>(
          queryKey,
          (oldTasks) =>
            oldTasks?.map((task) =>
              task.id === updatedTaskInfo.taskId
                ? {
                    ...task,
                    status: updatedTaskInfo.status,
                    order: updatedTaskInfo.order,
                  }
                : task
            ) ?? []
        );
      }
      return { previousTasks, queryKey }; // Pass queryKey in context too
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousTasks && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousTasks);
      }
      console.error("Failed to update task:", err);
      // Show error notification to user
    },

    // Invalidate or refetch on settlement (success or error) to ensure consistency
    onSettled: (data, error, variables, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}

// --- Add other hooks as needed ---
// export function useCreateSprint(projectId: string) { ... }
// export function useUpdateSprint(projectId: string, sprintId: string) { ... }
