// src/services/sprintService.ts

import apiClient from "../api/apiClient"; // Assuming apiClient is configured
import { Sprint } from "../types/SprintType"; // Adjust path as needed
import { ApiResponseTask } from "../types/SprintType"; // Adjust path as needed

// Use the same API_URL pattern for consistency, unless apiClient has baseURL set
const API_URL = "http://localhost:5050/api/v1";

export const sprintService = {
  /**
   * Fetches all tasks/items assigned to a specific sprint for a project.
   * REQUIRED for displaying the sprint board items.
   */
  async getSprintTasks(
    projectId: string,
    sprintId: string
  ): Promise<ApiResponseTask[]> {
    try {
      // *** Verify this endpoint path with your backend implementation ***
      const response = await apiClient.get(
        `${API_URL}/projects/${projectId}/sprints/${sprintId}/tasks`
      );
      // Ensure the backend response data is an array of tasks matching ApiResponseTask
      return response.data as ApiResponseTask[];
    } catch (error) {
      console.error(`Error fetching tasks for sprint ${sprintId}:`, error);
      throw error; // Re-throw for the calling component to handle UI feedback
    }
  },

  /**
   * Fetches details for a single sprint.
   */
  async getSprintDetails(projectId: string, sprintId: string): Promise<Sprint> {
    try {
      const response = await apiClient.get(
        `${API_URL}/projects/${projectId}/sprints/${sprintId}`
      );
      return response.data as Sprint;
    } catch (error) {
      console.error(`Error fetching details for sprint ${sprintId}:`, error);
      throw error;
    }
  },

  /**
   * Fetches all sprints belonging to a specific project.
   */
  async getAllSprintsForProject(projectId: string): Promise<Sprint[]> {
    try {
      const response = await apiClient.get(
        `${API_URL}/projects/${projectId}/sprints`
      );
      return response.data as Sprint[];
    } catch (error) {
      console.error(`Error fetching sprints for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new sprint within a project.
   * @param projectId The ID of the project.
   * @param sprintData Data for the new sprint (e.g., name, goal, dates). Exclude id, projectId.
   */
  async createSprint(
    projectId: string,
    sprintData: Omit<Sprint, "id" | "projectId" | "createdAt" | "updatedAt">
  ): Promise<Sprint> {
    try {
      const response = await apiClient.post(
        `${API_URL}/projects/${projectId}/sprints`,
        sprintData
      );
      return response.data as Sprint;
    } catch (error) {
      console.error(`Error creating sprint for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Updates an existing sprint.
   * @param projectId The ID of the project.
   * @param sprintId The ID of the sprint to update.
   * @param updateData The fields to update.
   */
  async updateSprint(
    projectId: string,
    sprintId: string,
    updateData: Partial<Omit<Sprint, "id" | "projectId">>
  ): Promise<Sprint> {
    try {
      const response = await apiClient.put(
        `${API_URL}/projects/${projectId}/sprints/${sprintId}`,
        updateData
      );
      return response.data as Sprint;
    } catch (error) {
      console.error(`Error updating sprint ${sprintId}:`, error);
      throw error;
    }
  },

  /**
   * Deletes a sprint.
   */
  async deleteSprint(projectId: string, sprintId: string): Promise<void> {
    try {
      await apiClient.delete(
        `${API_URL}/projects/${projectId}/sprints/${sprintId}`
      );
    } catch (error) {
      console.error(`Error deleting sprint ${sprintId}:`, error);
      throw error;
    }
  },

  async updateSprintStatus(
    projectId: string,
    sprintId: string,
    updateData: Partial<Omit<Sprint, "id" | "projectId">>
  ): Promise<Sprint> {
    try {
      const response = await apiClient.patch(
        `${API_URL}/projects/${projectId}/sprints/${sprintId}/status`,
        updateData
      );
      return response.data as Sprint;
    } catch (error) {
      console.error(`Error updating sprint status ${sprintId}:`, error);
      throw error;
    }
  },

  // Add other sprint-specific actions if needed (e.g., startSprint, completeSprint)
  // async startSprint(projectId: string, sprintId: string): Promise<Sprint> { ... }
  // async completeSprint(projectId: string, sprintId: string): Promise<Sprint> { ... }
};
