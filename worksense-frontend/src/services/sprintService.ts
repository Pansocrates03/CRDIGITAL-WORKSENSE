// src/services/sprintService.ts

import apiClient from "../api/apiClient"; // Assuming apiClient is configured
import { Sprint, ApiResponseTask } from "../types/SprintType"; // Adjust path as needed

export const sprintService = {
  /**
   * Fetches all tasks/items assigned to a specific sprint for a project.
   * Uses the backend route: GET /projects/:projectId/sprints/:sprintId/tasks
   * (Which internally calls taskController.getSprintTasks for Scenario A)
   */
  async getSprintTasks(
    projectId: string,
    sprintId: string
  ): Promise<ApiResponseTask[]> {
    try {
      // Corrected URL: using /sprints/ (plural) to match sprint.routes.ts
      const response = await apiClient.get(
        // This path assumes your sprint router handles tasks under it
        `/projects/${projectId}/sprints/${sprintId}/tasks`
        // If task fetching is NOT nested under sprints route, adjust this URL
        // e.g., `/tasks?projectId=${projectId}&sprintId=${sprintId}` if task routes handle it
      );
      console.log(`API Response for Sprint ${sprintId} Tasks:`, response.data);
      return response.data as ApiResponseTask[];
    } catch (error) {
      console.error(`Error fetching tasks for sprint ${sprintId}:`, error);
      throw error;
    }
  },

  /**
   * Fetches details for a single sprint.
   * Uses backend route: GET /projects/:projectId/sprints/:sprintId
   */
  async getSprintDetails(projectId: string, sprintId: string): Promise<Sprint> {
    try {
      const response = await apiClient.get(
        `/projects/${projectId}/sprints/${sprintId}`
      );
      return response.data as Sprint;
    } catch (error) {
      console.error(`Error fetching details for sprint ${sprintId}:`, error);
      throw error;
    }
  },

  /**
   * Fetches all sprints belonging to a specific project.
   * Uses backend route: GET /projects/:projectId/sprints
   */
  async getAllSprintsForProject(projectId: string): Promise<Sprint[]> {
    try {
      // Ensure backend supports filtering by status if needed, e.g., ?status=Active&status=Planned
      const response = await apiClient.get(
        `/projects/${projectId}/sprints` // Fetch all first, filter client-side if needed
      );
      return response.data as Sprint[];
    } catch (error) {
      console.error(`Error fetching sprints for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new sprint within a project.
   * Uses backend route: POST /projects/:projectId/sprints
   */
  async createSprint(
    projectId: string,
    sprintData: Omit<
      Sprint,
      "id" | "projectId" | "createdAt" | "updatedAt" | "status"
    > // Status is set by backend
  ): Promise<Sprint> {
    try {
      const response = await apiClient.post(
        `/projects/${projectId}/sprints`,
        sprintData
      );
      return response.data as Sprint;
    } catch (error) {
      console.error(`Error creating sprint for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Updates an existing sprint (metadata like name, goal, dates).
   * Uses backend route: PUT/PATCH /projects/:projectId/sprints/:sprintId
   */
  async updateSprint(
    projectId: string,
    sprintId: string,
    updateData: Partial<Omit<Sprint, "id" | "projectId" | "status">> // Exclude status if updated separately
  ): Promise<Sprint> {
    try {
      // Using PUT might require sending the full object, PATCH is better for partial
      const response = await apiClient.put(
        // Or PATCH if backend supports it
        `/projects/${projectId}/sprints/${sprintId}`,
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
   * Uses backend route: DELETE /projects/:projectId/sprints/:sprintId
   */
  async deleteSprint(projectId: string, sprintId: string): Promise<void> {
    try {
      await apiClient.delete(`/projects/${projectId}/sprints/${sprintId}`);
    } catch (error) {
      console.error(`Error deleting sprint ${sprintId}:`, error);
      throw error;
    }
  },

  /**
   * Updates the status of a sprint.
   * Uses backend route: PATCH /projects/:projectId/sprints/:sprintId/status
   */
  async updateSprintStatus(
    projectId: string,
    sprintId: string,
    // Send only the status field in the body for this specific endpoint
    statusData: { status: Sprint["status"] }
  ): Promise<Sprint> {
    try {
      const response = await apiClient.patch(
        `/projects/${projectId}/sprints/${sprintId}/status`,
        statusData // Send object { status: "NewStatus" }
      );
      // Backend returns the updated sprint object
      return response.data as Sprint;
    } catch (error) {
      console.error(`Error updating sprint status ${sprintId}:`, error);
      throw error;
    }
  },
};
