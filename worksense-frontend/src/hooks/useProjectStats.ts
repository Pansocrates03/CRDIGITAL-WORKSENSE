import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';

export interface ProjectStats {
    totalUsers: number;
    totalPoints: number;
    averagePoints: number;
    topPerformer: {
        name: string;
        points: number;
        lastUpdate: any;
    } | null;
    totalBacklogItems: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    completionRate: number;
    epics: number;
    stories: number;
    bugs: number;
    techTasks: number;
}

export const useProjectStats = (projectId: string) => {
    return useQuery<ProjectStats>({
        queryKey: ['project-stats', projectId],
        queryFn: async () => {
            const response = await apiClient.get(`/projects/${projectId}/gamification/stats`);
            return response.data;
        },
        enabled: !!projectId,
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 10000 // Consider data stale after 10 seconds
    });
};