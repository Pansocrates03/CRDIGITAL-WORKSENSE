import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';

export interface LeaderboardEntry {
    userId: number;
    points: number;
    name: string;
    avatarUrl: string | null;
    rank: number;
}

export const useProjectLeaderboard = (projectId: string, limit?: number) => {
    return useQuery<LeaderboardEntry[]>({
        queryKey: ['project-leaderboard', projectId, limit],
        queryFn: async () => {
            const response = await apiClient.get(`/projects/${projectId}/gamification/leaderboard`);
            return limit ? response.data.slice(0, limit) : response.data;
        },
        enabled: !!projectId,
        refetchInterval: 60000, // Refetch every minute
        staleTime: 30000 // Consider data stale after 30 seconds
    });
};