import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';

export interface ActivityItem {
    type: 'task_completion' | 'badge_earned';
    timestamp: string;
    user: string;
    userId: string | number;
    data: {
        // For task_completion
        itemTitle?: string;
        itemId?: string;
        itemType?: string;
        points?: number;
        // For badge_earned
        badgeName?: string;
        badgeIcon?: string;
    };
}

export const useProjectActivity = (projectId: string, limit: number = 10) => {
    return useQuery<ActivityItem[]>({
        queryKey: ['project-activity', projectId, limit],
        queryFn: async () => {
            const response = await apiClient.get(`/projects/${projectId}/gamification/activity?limit=${limit}`);
            return response.data;
        },
        enabled: !!projectId,
        refetchInterval: 60000, // Refetch every minute
        staleTime: 30000 // Consider data stale after 30 seconds
    });
};