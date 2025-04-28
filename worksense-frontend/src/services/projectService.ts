import ProjectDetails from "@/types/ProjectType";
import apiClient from "../api/apiClient";
import Member from "@/types/MemberType";

const API_URL = "http://localhost:5050/api/v1";

export const projectService = {
  // Gets the project details
  async fetchProjectDetails(id: string): Promise<ProjectDetails> {
    try {
      const response = await apiClient.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching project:", error);
      throw error;
    }
  },

  // Gets the list of members in a project
  async fetchProjectMembers(id: string): Promise<Member[]> {
    try {
      const response = await apiClient.get(`${API_URL}/${id}/members`);
      return response.data;
    } catch (error) {
      console.error("Error fetching members");
      throw error;
    }
  },

  // Gets the list of the projects a member has access to
  async fetchUserProjects(): Promise<ProjectDetails[]> {
    try {
      const response = await apiClient.get(`${API_URL}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching members");
      throw error;
    }
  },
};
