// src/services/taskService.ts

import apiClient from "../api/apiClient"; // Adjust path if needed
import { ApiResponseTask } from "../types/SprintType"; // Adjust path if needed

// Use the same API_URL pattern or rely on apiClient baseURL
const API_URL = "http://localhost:5050/api/v1";

// Define the shape of data needed for partial updates (PATCH request)
// Include fields you expect to update individually or together.
// For drag-and-drop, 'status' and 'order' are key.
type UpdateTaskPayload = Partial<
  Pick<
    ApiResponseTask,
    | "title"
    | "description"
    | "status"
    | "priority"
    | "order"
    | "startDate"
    | "endDate"
    | "sprintId" // Potentially needed if moving between backlog/sprint via UI
    // Add 'assigneeId' here if you update assignee via task service
  >
>;

// Define the shape of data needed to create a new task
// Adjust based on required fields in your backend
type CreateTaskPayload = Omit<
  ApiResponseTask,
  | "id"
  | "assignees" // Backend likely expects assigneeId
  | "createdAt"
  | "updatedAt"
> & { assigneeId?: string | number | null }; // Add assigneeId explicitly if needed

export const taskService = {
  /**
   * Fetches details for a single task/item.
   * @param projectId - ID of the project the task belongs to.
   * @param taskId - ID of the task/item to fetch.
   */
  async getTaskDetails(
    projectId: string,

    taskId: string | number
  ): Promise<ApiResponseTask> {
    try {
      // *** Verify this endpoint path with your backend ***
      const response = await apiClient.get(
        `${API_URL}/projects/${projectId}/tasks/${taskId}`
      );
      return response.data as ApiResponseTask;
    } catch (error) {
      console.error(`Error fetching details for task ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Updates specific fields of an existing task/item.
   * Uses PATCH for partial updates. Ideal for drag-and-drop status/order changes.
   * @param projectId - ID of the project.
   * @param taskId - ID of the task/item to update.
   * @param updateData - An object containing the fields to update (e.g., { status: 'InProgress', order: 1.5 }).
   */
  async updateTask(
    projectId: string,
    taskId: string | number,
    updateData: UpdateTaskPayload
  ): Promise<ApiResponseTask> {
    try {
      // *** Verify this endpoint path and method (PATCH preferred) with your backend ***
      const response = await apiClient.patch(
        `${API_URL}/projects/${projectId}/tasks/${taskId}`,
        updateData
      );
      // Assuming the backend returns the full updated task object
      return response.data as ApiResponseTask;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  },

  async updateTaskStatus(
    projectId: string,
    taskId: string | number,
    updateData: UpdateTaskPayload
  ): Promise<ApiResponseTask> {
    try {
      const response = await apiClient.patch(
        `${API_URL}/projects/${projectId}/tasks/${taskId}/status`,
        updateData
      );
      return response.data as ApiResponseTask;
    } catch (error) {
      console.error(`Error updating task status ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new task/item within a project's backlog (or potentially a sprint).
   * @param projectId - ID of the project.
   * @param taskData - Data for the new task. Ensure required fields are included.
   */
  async createTask(
    projectId: string,
    sprintId: string,
    taskData: CreateTaskPayload
  ): Promise<ApiResponseTask> {
    try {
      // *** Verify this endpoint path with your backend ***
      // Might be /projects/${projectId}/backlog/items or similar
      const response = await apiClient.post(
        `${API_URL}/projects/${projectId}/sprints/${sprintId}/tasks`,
        taskData
      );
      return response.data as ApiResponseTask;
    } catch (error) {
      console.error(`Error creating task in project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a task/item.
   * @param projectId - ID of the project.
   * @param taskId - ID of the task/item to delete.
   */
  async deleteTask(projectId: string, taskId: string | number): Promise<void> {
    try {
      // *** Verify this endpoint path with your backend ***
      await apiClient.delete(
        `${API_URL}/projects/${projectId}/tasks/${taskId}`
      );
      // No return value needed for successful delete
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error);
      throw error;
    }
  },
};
