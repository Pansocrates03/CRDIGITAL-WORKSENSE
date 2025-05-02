import ProjectDetails from "@/types/ProjectType";
import apiClient from "../api/apiClient";
import Member from "@/types/MemberType";
import MemberDetailed from "@/types/MemberDetailedType";

import { API_URL } from "../../config/env.config";

const FULL_API_URL = API_URL + "/api/v1";

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
      const response = await apiClient.get(`${FULL_API_URL}/projects/${id}`);

      return response.data;
    } catch (error) {
      console.error("Error fetching project details:", error);
      throw error;
    }
  },

  // Gets the list of members in a project
  async fetchProjectMembers(id: string): Promise<Member[]> {
    try {
      const response = await apiClient.get(
        `${FULL_API_URL}/projects/${id}/members`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching project members:", error);
      throw error;
    }
  },

  // Gets the list of members in a project with email and name
  async fetchProjectMembersDetailed(id: string): Promise<MemberDetailed[]> {
    try {
      const response = await apiClient.get(
        `${FULL_API_URL}/projects/${id}/members/members-detail`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching project members with details:", error);
      throw error;
    }
  },

  // Gets the list of the projects a member has access to
  async fetchUserProjects(): Promise<ProjectDetails[]> {
    try {
      const response = await apiClient.get(`${FULL_API_URL}/projects/`);
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
      await apiClient.put(
        `${FULL_API_URL}/projects/${projectId}/members/${userId}`,
        {
          projectRoleId: roleId,
        }
      );
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
      await apiClient.post(`${FULL_API_URL}/projects/${projectId}/members`, {
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
      await apiClient.delete(
        `${FULL_API_URL}/projects/${projectId}/members/${userId}`
      );
    } catch (error) {
      console.error("Error removing member from project:", error);
      throw error;
    }
  },

  async createProejct(receivedData: CreateProject): Promise<ProjectDetails> {
    try {
      // Primero se debe crear el proyecto

      const response = await apiClient.post(`${FULL_API_URL}/projects/`, {
        name: receivedData.name,
        description: receivedData.description,
        context: null,
      });

      // Luego se deben agregar los miembros al proyecto
      for (let i = 0; i < receivedData.members.length; i++) {
        const member = receivedData.members[i];

        await apiClient.post(
          `${FULL_API_URL}/projects/${response.data.id}/members`,
          {
            projectRoleId: member.projectRoleId,
            userId: member.userId, // Asegúrate de que `member` contenga el ID del miembro
          }
        );
      }

      // En caso de que se haya seleccionado, se deben crear los EPICs y los SPRINTS

      return response.data;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },
};
