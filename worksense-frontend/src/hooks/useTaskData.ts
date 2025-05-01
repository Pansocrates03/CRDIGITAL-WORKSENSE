// src/hooks/useTaskData.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sprintService } from "../services/sprintService"; // getSprintTasks is here
import { taskService } from "../services/taskService"; // updateTask, etc are here
import { ApiResponseTask } from "../types/SprintType"; // Or specific TaskType path
import { sprintQueryKeys, taskQueryKeys } from "./config/queryKeys"; // Use keys from both

/**
 * Hook to fetch tasks for the selected sprint using sprintService.
 */
export function useSprintTasks(projectId?: string, sprintId?: string) {
  const enabled = !!projectId && !!sprintId;

  return useQuery<ApiResponseTask[], Error>({
    queryKey: sprintQueryKeys.tasks(projectId!, sprintId!), // Key linked to the sprint
    queryFn: () => {
      if (!projectId || !sprintId)
        return Promise.reject(new Error("Project and Sprint ID required"));
      // Fetch tasks for sprint using the function in sprintService (which calls the correct backend route)
      return sprintService.getSprintTasks(projectId, sprintId);
    },
    enabled: enabled,
  });
}

/**
 * Hook to update a task (status, order, assignee etc.) using taskService.
 */
export function useUpdateTask(projectId?: string) {
  // Needs projectId if service needs it
  const queryClient = useQueryClient();

  // Define type for the mutation function variables more explicitly
  type UpdateTaskVariables = {
    taskId: string | number;
    // Use the specific payload type from taskService
    data: Parameters<typeof taskService.updateTask>[2];
  };

  return useMutation<ApiResponseTask, Error, UpdateTaskVariables>({
    // Define mutation types
    mutationFn: (variables: UpdateTaskVariables) => {
      if (!projectId)
        throw new Error("Project ID is required for updating task.");
      return taskService.updateTask(
        projectId,
        variables.taskId,
        variables.data
      );
    },

    // Example simple invalidation (Refine with optimistic updates later)
    onSuccess: (updatedTask, variables) => {
      console.log("Task update success:", updatedTask);
      // Invalidate the query for the sprint this task belongs to, forcing a refetch
      if (projectId && updatedTask.sprintId) {
        queryClient.invalidateQueries({
          queryKey: sprintQueryKeys.tasks(projectId, updatedTask.sprintId),
        });
      }
      // Also invalidate the specific task detail query if you use one elsewhere
      queryClient.invalidateQueries({
        queryKey: taskQueryKeys.detail(variables.taskId),
      });
    },
    onError: (error, variables) => {
      console.error("Task update failed:", error);
      // Add user notification logic here
    },
  });
}

/**
 * Hook to create a task instance in /tasks from a backlog item using taskService.
 */
export function useCreateTaskFromBacklog() {
  const queryClient = useQueryClient();

  // Define type for the mutation function variables more explicitly
  type CreateTaskVariables = {
    projectId: string;
    sprintId: string;
    // Use the specific payload type from taskService
    payload: Parameters<typeof taskService.createTaskFromBacklog>[2];
  };

  return useMutation<ApiResponseTask, Error, CreateTaskVariables>({
    mutationFn: (variables: CreateTaskVariables) => {
      return taskService.createTaskFromBacklog(
        variables.projectId,
        variables.sprintId,
        variables.payload
      );
    },
    onSuccess: (createdTask, variables) => {
      console.log("Task created from backlog:", createdTask);
      // Invalidate the task list for the sprint it was added to
      queryClient.invalidateQueries({
        queryKey: sprintQueryKeys.tasks(
          variables.projectId,
          variables.sprintId
        ),
      });
      // Potentially invalidate the source backlog list query if needed
    },
    onError: (error) => {
      console.error("Failed to create task from backlog:", error);
      // Add user notification
    },
  });
}

// Add useDeleteTask hook here later if needed...
