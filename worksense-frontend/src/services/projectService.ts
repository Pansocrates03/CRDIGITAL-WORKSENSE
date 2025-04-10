import apiClient from "../api/apiClient"; // Import the configured instance

const API_URL = "http://localhost:5050"; // Using the same port as the backend

export interface Project {
  id: string;
  name: string;
  description: string;
  items: Array<{
    id: string;
    name: string;
    description: string;
    tag: string;
    status: string;
    priority: string;
    size: string;
    author: string;
    assignee: string[];
    acceptanceCriteria: string[];
    sprint?: string;
    items?: Array<any>;
    comments?: Array<any>;
    createdAt: string;
    updatedAt: string;
  }>;
  members: Array<{
    id: string;
    name?: string;
    avatar?: string;
    [key: string]: any;
  }>;
  progress?: {
    webDashboard: number;
    database: number;
  };
}

export interface CreateProjectData {
  name: string;
  description: string;
}

export const projectService = {
  async getProject(id: string): Promise<Project> {
    try {
      const response = await apiClient.get(`${API_URL}/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching project:", error);
      throw error;
    }
  },

  async getAllProjects(): Promise<Project[]> {
    try {
      const response = await apiClient.get(`${API_URL}/projectsbyuser`);
      return response.data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  },

  async createProject(projectData: CreateProjectData): Promise<Project> {
    try {
      const response = await apiClient.post(`${API_URL}/projects`, projectData);
      return response.data;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },

  async getProjectMembers(projectId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(
        `${API_URL}/projects/${projectId}/members`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching project members:", error);
      throw error;
    }
  },

  async addProjectMember(
    projectId: string,
    userId: number,
    roleId: string
  ): Promise<any> {
    try {
      const response = await apiClient.post(
        `${API_URL}/projects/${projectId}/members`,
        { userId, roleId }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding project member:", error);
      throw error;
    }
  },
};
