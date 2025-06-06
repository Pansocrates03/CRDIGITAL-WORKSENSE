import axios from 'axios';
import { API_URL } from '../config';

export const getFrumen = async (projectId: string, sprintId: string) => {
  try {
    const response = await axios.get(`${API_URL}/frumen/projects/${projectId}/sprints/${sprintId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching frumen items:', error);
    throw error;
  }
};
