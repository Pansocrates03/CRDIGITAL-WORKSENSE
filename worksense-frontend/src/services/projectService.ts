import apiClient from "../api/apiClient"; // Import the configured instance

const API_URL = "http://localhost:5050"; // Using the same port as the backend

export interface Project {
  id: string;
  name: string;
  description: string;
  bugs: Array<{
    id: string;
    [key: string]: any;
  }>;
  epics: Array<{
    id: string;
    stories: Array<{
      id: string;
      comments: Array<any>;
      tasks: Array<any>;
      [key: string]: any;
    }>;
    [key: string]: any;
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
      const response = await apiClient.get(`${API_URL}/projects`);
      return response.data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  },
};
