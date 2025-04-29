import ProjectDetails from "@/types/ProjectType";
import apiClient from "../api/apiClient";
import Member from "@/types/MemberType";
import MemberDetailed from "@/types/MemberDetailedType";

const API_URL = "http://localhost:5050/api/v1";

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
      const response = await apiClient.get(`${API_URL}/${id}/members-with-email`);
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
  async updateMemberRole(projectId: string, userId: number, roleId: string): Promise<void> {
    try {
      await apiClient.put(`${API_URL}/${projectId}/members/${userId}`, {
        projectRoleId: roleId,
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  },

  // Add a member to a project with a role
  async addMemberToProject(projectId: string, userId: number, roleId: string): Promise<void> {
    try {
      await apiClient.post(`${API_URL}/${projectId}/members`, {
        userId: userId,
        projectRoleId: roleId,
      });
    } catch (error) {
      console.error('Error adding member to project:', error);
      throw error;
    }
  },

  // Remove a member from a project
  async removeMemberFromProject(projectId: string, userId: number): Promise<void> {
    try {
      await apiClient.delete(`${API_URL}/${projectId}/members/${userId}`);
    } catch (error) {
      console.error('Error removing member from project:', error);
      throw error;
    }
  },
};
