import apiClient from '@/api/apiClient';

export interface AssignedItem {
  id: string;
  type: 'epic' | 'story' | 'bug' | 'task' | 'knowledge';
  name: string;
  status: string;
  assigneeId: string;
  projectId: string;
  description?: string;
  priority?: string;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface CompletedTask {
  id: string;
  name: string;
  completedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

class ForYouService {
  async getAssignedItems(userId: string, projectId: string): Promise<AssignedItem[]> {
    const response = await apiClient.get(`/for-you/assigned-items?userId=${userId}&projectId=${projectId}`);
    return response.data;
  }

  async getCompletedTasks(userId: string, projectId: string): Promise<CompletedTask[]> {
    const response = await apiClient.get(`/for-you/completed-tasks?userId=${userId}&projectId=${projectId}`);
    return response.data;
  }

  async updateItemStatus(itemId: string, newStatus: string): Promise<void> {
    await apiClient.put(`/for-you/items/${itemId}/status`, { status: newStatus });
  }
}

export const forYouService = new ForYouService(); 