import ProjectDetails from "@/types/ProjectType";
import apiClient from "../api/apiClient";
import Member from "@/types/MemberType";
import MemberDetailed from "@/types/MemberDetailedType";
import { id } from "date-fns/locale";
import { Task } from "@/types/Task";
import { CreateSprintData, CreateSprintItemDTO, Sprint } from "@/types/Sprint";
import { UpdateTaskData } from "@/types/Task";
const API_URL = "http://localhost:5050/api/v1";

interface CreateProject {
  name: string;
  description: string;
  context: object;
  members: Array<Member>;
}

export const projectService = {
  // Gets the project details
  async fetchProjectDetails(id: string): Promise<ProjectDetails> {
    try {
      const response = await apiClient.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching project details:", error);
      throw error;
    }
  },

  // Gets the list of members in a project
  async fetchProjectMembers(id: string): Promise<Member[]> {
    try {
      const response = await apiClient.get(`${API_URL}/${id}/members`);
      return response.data;
    } catch (error) {
      console.error("Error fetching project members:", error);
      throw error;
    }
  },

  // Gets the list of members in a project with email and name
  async fetchProjectMembersDetailed(id: string): Promise<MemberDetailed[]> {
    try {
      const response = await apiClient.get(`${API_URL}/${id}/members-detail`);
      return response.data;
    } catch (error) {
      console.error("Error fetching project members with details:", error);
      throw error;
    }
  },

  // Gets the list of the projects a member has access to
  async fetchUserProjects(): Promise<ProjectDetails[]> {
    try {
      const response = await apiClient.get(`${API_URL}/`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user projects:", error);
      throw error;
    }
  },

  // Update a member's role inside a project
  async updateMemberRole(
    projectId: string,
    userId: number,
    roleId: string
  ): Promise<void> {
    try {
      await apiClient.put(`${API_URL}/${projectId}/members/${userId}`, {
        projectRoleId: roleId,
      });
    } catch (error) {
      console.error("Error updating member role:", error);
      throw error;
    }
  },

  // Add a member to a project with a role
  async addMemberToProject(
    projectId: string,
    userId: number,
    roleId: string
  ): Promise<void> {
    try {
      await apiClient.post(`${API_URL}/${projectId}/members`, {
        userId: userId,
        projectRoleId: roleId,
      });
    } catch (error) {
      console.error("Error adding member to project:", error);
      throw error;
    }
  },

  // Remove a member from a project
  async removeMemberFromProject(
    projectId: string,
    userId: number
  ): Promise<void> {
    try {
      await apiClient.delete(`${API_URL}/${projectId}/members/${userId}`);
    } catch (error) {
      console.error("Error removing member from project:", error);
      throw error;
    }
  },

  async createProejct(receivedData: CreateProject): Promise<ProjectDetails> {
    try {
      // Primero se debe crear el proyecto
      const response = await apiClient.post(`${API_URL}/`, {
        name: receivedData.name,
        description: receivedData.description,
        context: null,
      });

      // Luego se deben agregar los miembros al proyecto
      for (let i = 0; i < receivedData.members.length; i++) {
        const member = receivedData.members[i];
        await apiClient.post(`${API_URL}/${response.data.id}/members`, {
          projectRoleId: "product-owner",
          userId: member.userId, // Asegúrate de que `member` contenga el ID del miembro
        });
      }

      // En caso de que se haya seleccionado, se deben crear los EPICs y los SPRINTS

      return response.data;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },

  // ==================================
  // Sprint Service Functions
  // ==================================

  /**
   * Creates a new Sprint within a Project.
   */
  async createSprint(
    projectId: string,
    sprintData: CreateSprintData // Use specific type for creation
  ): Promise<Sprint> {
    if (
      !projectId ||
      !sprintData ||
      !sprintData.startDate ||
      !sprintData.endDate
    ) {
      throw new Error(
        "Project ID, start date, and end date are required to create a sprint."
      );
    }
    try {
      const response = await apiClient.post(
        `/${projectId}/sprints`,
        sprintData
      );
      return response.data;
    } catch (error) {
      console.error(`Error creating sprint for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Gets all sprints for a project, optionally filtered by status.
   */
  async getSprints(
    projectId: string,
    status?: string | string[] // Optional status filter
  ): Promise<Sprint[]> {
    if (!projectId) throw new Error("Project ID is required.");
    try {
      const params = status ? { status: status } : {};
      const response = await apiClient.get(`/${projectId}/sprints`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching sprints for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Gets a single sprint by its ID within a specific project.
   */
  async getSprintById(projectId: string, sprintId: string): Promise<Sprint> {
    if (!projectId || !sprintId) {
      throw new Error("Project ID and Sprint ID are required.");
    }
    try {
      const response = await apiClient.get(`/${projectId}/sprints/${sprintId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching sprint ${sprintId} for project ${projectId}:`,
        error
      );
      throw error;
    }
  },

  // ==================================
  // Task (Sprint Item) Service Functions
  // ==================================

  /**
   * Gets all tasks for a specific sprint within a project. Returns a flat array.
   */
  async getTasksForSprint(
    projectId: string,
    sprintId: string
  ): Promise<Task[]> {
    if (!projectId || !sprintId) {
      throw new Error("Project ID and Sprint ID are required.");
    }
    try {
      const response = await apiClient.get(
        `/${projectId}/sprints/${sprintId}/tasks`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching tasks for sprint ${sprintId} in project ${projectId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Adds a task (derived from backlog) to a sprint.
   */
  async addTaskToSprint(
    projectId: string,
    sprintId: string,
    taskData: CreateSprintItemDTO // Requires { type, originalId, originalType, assigneeId?, title?, description? }
  ): Promise<Task> {
    if (
      !projectId ||
      !sprintId ||
      !taskData ||
      !taskData.type ||
      !taskData.originalId ||
      !taskData.originalType
    ) {
      throw new Error(
        "Project ID, Sprint ID, and required task creation data (type, originalId, originalType) are needed."
      );
    }
    try {
      const response = await apiClient.post(
        `/${projectId}/sprints/${sprintId}/tasks`,
        taskData
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error adding task to sprint ${sprintId} in project ${projectId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Updates general details of a specific task (NOT status).
   */
  async updateTask(
    projectId: string,
    taskId: string,
    updateData: UpdateTaskData // Use specific type for update data { title?, description?, assigneeId?, priority?, order?, etc. }
  ): Promise<Task> {
    if (
      !projectId ||
      !taskId ||
      !updateData ||
      Object.keys(updateData).length === 0
    ) {
      throw new Error("Project ID, Task ID, and update data are required.");
    }
    // Prevent accidental status update via this method
    if (updateData.hasOwnProperty("status")) {
      console.warn(
        "Attempted to update status via updateTask. Use updateTaskStatus instead."
      );
      delete (updateData as any).status; // Remove status if present
      if (Object.keys(updateData).length === 0) {
        throw new Error(
          "No valid fields provided for update after removing status."
        );
      }
    }

    try {
      const response = await apiClient.patch(`/tasks/${taskId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(
        `Error updating task ${taskId} in project ${projectId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Updates *only* the status of a specific task.
   */
  async updateTaskStatus(
    projectId: string,
    taskId: string,
    status: string // Use string or a status enum type
  ): Promise<{ message: string; id: string; status: string }> {
    // Match controller response
    if (!projectId || !taskId || !status) {
      throw new Error("Project ID, Task ID, and status are required.");
    }
    try {
      const response = await apiClient.patch(
        `/${projectId}/tasks/${taskId}/status`,
        { status } // Send only status in the body
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating status for task ${taskId} in project ${projectId}:`,
        error
      );
      throw error;
    }
  },

  /**
   * Deletes a specific task.
   */
  async deleteTask(
    projectId: string,
    taskId: string
  ): Promise<{ message: string; id: string }> {
    // Match controller response
    if (!projectId || !taskId) {
      throw new Error("Project ID and Task ID are required.");
    }
    try {
      const response = await apiClient.delete(`/${projectId}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error deleting task ${taskId} in project ${projectId}:`,
        error
      );
      throw error;
    }
  },
}; // End projectService
