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
  type: 'epic' | 'story' | 'bug' | 'task' | 'knowledge';
  name: string;
  status: string;
  assigneeId: string;
  projectId: string;
  description?: string;
  priority?: string;
  completedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface Badge {
  earnedAt: string;
  icon: string;
  name: string;
  points: number;
  projectId: string;
}

export interface PersonalGamificationInfo {
  points: number;
  name: string;
  personalPhrase: string | null;
  profilePicture: string | null;
  badges: Badge[];
}

export interface UpdateItemStatusResponse {
  id: string;
  status: string;
  toast?: {
    type: string;
    points: number;
    newBadges?: any[];
    totalPoints?: number;
    level?: number;
    assigneeId?: string | number;
  };
  [key: string]: any;
}

class ForYouService {
  async getAssignedItems(userId: string, projectId: string): Promise<AssignedItem[]> {
    const response = await apiClient.get(`/for-you/assigned-items?userId=${userId}&projectId=${projectId}`);
    return response.data;
  }

  async getCompletedTasks(userId: string, projectId: string, limit?: number): Promise<CompletedTask[]> {
    const response = await apiClient.get(`/for-you/completed-tasks?userId=${userId}&projectId=${projectId}${limit ? `&limit=${limit}` : ''}`);
    return response.data;
  }

  async updateItemStatus(itemId: string, newStatus: string): Promise<UpdateItemStatusResponse> {
    const response = await apiClient.put(`/for-you/items/${itemId}/status`, { status: newStatus });
    return response.data;
  }

  async getPersonalGamificationInfo(userId: string, projectId: string): Promise<PersonalGamificationInfo> {
    const res = await apiClient.get(`/for-you-gamification/projects/${projectId}/gamification/leaderboard/${userId}`);
    return res.data;
  }

  async updatePersonalGamificationInfo(userId: string, projectId: string, data: { personalPhrase: string; profilePicture: string }) {
    const res = await apiClient.put(`/for-you-gamification/projects/${projectId}/gamification/leaderboard/${userId}`, data);
    return res.data;
  }
}

export const forYouService = new ForYouService(); 