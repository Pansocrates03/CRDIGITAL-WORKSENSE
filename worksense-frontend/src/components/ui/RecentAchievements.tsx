// src/components/ui/RecentAchievements.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import apiClient from "@/api/apiClient.ts";
import { Award, Clock } from 'lucide-react';

interface RecentAchievementsProps {
    projectId: string;
    maxEntries?: number;
}

interface Achievement {
    userId: number;
    userName: string;
    badgeName: string;
    badgeIcon: string;
    earnedAt: string;
    points: number;
}

const RecentAchievements: React.FC<RecentAchievementsProps> = ({
                                                                   projectId,
                                                                   maxEntries = 3
                                                               }) => {
    const { data: achievements, isLoading } = useQuery({
        queryKey: ['recent-achievements', projectId],
        queryFn: async () => {
            // This would need a new API endpoint
            const response = await apiClient.get(`/projects/${projectId}/gamification/recent-achievements`);
            return response.data as Achievement[];
        },
        enabled: !!projectId,
        refetchInterval: 60000
    });

    if (isLoading) {
        return (
            <Card style={{ backgroundColor: 'var(--background-primary)' }}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Award className="w-5 h-5" style={{ color: 'var(--accent-pink)' }} />
                        Recent Achievements
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div
                                className="h-4 rounded w-full mb-2"
                                style={{ backgroundColor: 'var(--neutral-200)' }}
                            ></div>
                            <div
                                className="h-3 rounded w-2/3"
                                style={{ backgroundColor: 'var(--neutral-300)' }}
                            ></div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (!achievements || achievements.length === 0) {
        return (
            <Card style={{ backgroundColor: 'var(--background-primary)' }}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Award className="w-5 h-5" style={{ color: 'var(--accent-pink)' }} />
                        Recent Achievements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-center py-4" style={{ color: 'var(--neutral-600)' }}>
                        No achievements yet. Complete tasks to earn badges!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card style={{ backgroundColor: 'var(--background-primary)' }}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Award className="w-5 h-5" style={{ color: 'var(--accent-pink)' }} />
                    Recent Achievements
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {achievements.slice(0, maxEntries).map((achievement, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 p-2 rounded-[var(--radius)]"
                        style={{ backgroundColor: 'var(--surface-light)' }}
                    >
                        <span className="text-2xl">{achievement.badgeIcon}</span>
                        <div className="flex-1 min-w-0">
                            <p
                                className="font-medium text-sm"
                                style={{ color: 'var(--text-primary)' }}
                            >
                <span style={{ color: 'var(--accent-pink)' }}>
                  {achievement.userName}
                </span>{' '}
                                earned {achievement.badgeName}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" style={{ color: 'var(--neutral-500)' }} />
                                <p
                                    className="text-xs"
                                    style={{ color: 'var(--neutral-600)' }}
                                >
                                    {new Date(achievement.earnedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default RecentAchievements;