import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import apiClient from "@/api/apiClient.ts";
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface ProjectLeaderboardProps {
    projectId: string;
    className?: string;
    maxEntries?: number;
    compact?: boolean; // New prop
}

interface LeaderboardEntry {
    userId: number;
    points: number;
    name: string;
    avatarUrl: string | null;
    rank: number;
}

const getRankIcon = (rank: number, compact: boolean = false) => {
    const iconClass = compact ? "w-3 h-3" : "w-4 h-4";

    switch (rank) {
        case 1:
            return <Trophy className={`${iconClass} text-[var(--accent-pink)]`} />;
        case 2:
            return <Medal className={`${iconClass} text-[var(--neutral-500)]`} />;
        case 3:
            return <Award className={`${iconClass} text-[var(--warning)]`} />;
        default:
            return <TrendingUp className={`${iconClass} text-[var(--accent-blue)]`} />;
    }
};

const ProjectLeaderboard: React.FC<ProjectLeaderboardProps> = ({
                                                                   projectId,
                                                                   className = '',
                                                                   maxEntries = 5,
                                                                   compact = false
                                                               }) => {
    const { data: leaderboard, isLoading, error } = useQuery({
        queryKey: ['project-leaderboard', projectId],
        queryFn: async () => {
            const response = await apiClient.get(`/projects/${projectId}/gamification/leaderboard`);
            return response.data as LeaderboardEntry[];
        },
        enabled: !!projectId,
        refetchInterval: 60000
    });

    if (isLoading) {
        return (
            <Card className={`${className}`} style={{ backgroundColor: 'var(--background-primary)' }}>
                <CardHeader className={compact ? "pb-2" : ""}>
                    <CardTitle className={`flex items-center gap-2 ${compact ? 'text-base' : ''}`} style={{ color: 'var(--text-primary)' }}>
                        <Trophy className={compact ? "w-4 h-4" : "w-5 h-5"} style={{ color: 'var(--accent-pink)' }} />
                        Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent className={`space-y-${compact ? '2' : '3'}`}>
                    {[1, 2, 3].slice(0, compact ? 2 : 3).map((i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div
                                className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full`}
                                style={{ backgroundColor: 'var(--neutral-200)' }}
                            ></div>
                            <div className="flex-1">
                                <div
                                    className={`h-3 rounded ${compact ? 'w-20' : 'w-24'} mb-1`}
                                    style={{ backgroundColor: 'var(--neutral-200)' }}
                                ></div>
                                <div
                                    className={`h-2 rounded ${compact ? 'w-12' : 'w-16'}`}
                                    style={{ backgroundColor: 'var(--neutral-300)' }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (error || !leaderboard || leaderboard.length === 0) {
        return (
            <Card className={`${className}`} style={{ backgroundColor: 'var(--background-primary)' }}>
                <CardHeader className={compact ? "pb-2" : ""}>
                    <CardTitle className={`flex items-center gap-2 ${compact ? 'text-base' : ''}`} style={{ color: 'var(--text-primary)' }}>
                        <Trophy className={compact ? "w-4 h-4" : "w-5 h-5"} style={{ color: 'var(--accent-pink)' }} />
                        Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className={`text-center py-2 ${compact ? 'text-xs' : 'text-sm'}`} style={{ color: 'var(--neutral-600)' }}>
                        No activity yet. Complete some tasks to see the leaderboard!
                    </p>
                </CardContent>
            </Card>
        );
    }

    const topEntries = leaderboard.slice(0, maxEntries);

    return (
        <Card className={`${className}`} style={{ backgroundColor: 'var(--background-primary)' }}>
            <CardHeader className={compact ? "pb-2" : ""}>
                <CardTitle className={`flex items-center gap-2 ${compact ? 'text-base' : ''}`} style={{ color: 'var(--text-primary)' }}>
                    <Trophy className={compact ? "w-4 h-4" : "w-5 h-5"} style={{ color: 'var(--accent-pink)' }} />
                    Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent className={`space-y-${compact ? '2' : '3'}`}>
                {topEntries.map((entry) => (
                    <div
                        key={entry.userId}
                        className={`flex items-center gap-${compact ? '2' : '3'} p-${compact ? '1' : '2'} rounded-[var(--radius)] transition-colors hover:bg-[var(--surface-light)]`}
                    >
                        {/* Rank Icon */}
                        <div className={`flex items-center justify-center ${compact ? 'w-6 h-6' : 'w-8 h-8'}`}>
                            {getRankIcon(entry.rank, compact)}
                        </div>

                        {/* User Avatar */}
                        <div
                            className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full flex items-center justify-center text-xs font-semibold`}
                            style={{
                                backgroundColor: '#AC1754',
                                color: 'var(--accent-blue-text)'
                            }}
                        >
                            {entry.avatarUrl ? (
                                <img
                                    src={entry.avatarUrl}
                                    alt={entry.name}
                                    className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} rounded-full object-cover`}
                                    style={{ backgroundColor: '#AC1754' }}
                                />
                            ) : (
                                entry.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <p
                                className={`font-medium truncate ${compact ? 'text-xs' : 'text-sm'}`}
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {entry.name}
                            </p>
                            {!compact && (
                                <p
                                    className="text-xs"
                                    style={{ color: 'var(--neutral-600)' }}
                                >
                                    Rank #{entry.rank}
                                </p>
                            )}
                        </div>

                        {/* Points Badge */}
                        <Badge
                            variant="secondary"
                            className={`font-semibold ${compact ? 'text-xs px-1.5 py-0' : ''}`}
                            style={{
                                backgroundColor: entry.rank === 1 ? 'var(--accent-pink-light)' : 'var(--surface-light)',
                                color: entry.rank === 1 ? 'var(--accent-pink)' : 'var(--text-primary)',
                                border: entry.rank === 1 ? '1px solid var(--accent-pink)' : '1px solid var(--surface-light-border)'
                            }}
                        >
                            {entry.points} pts
                        </Badge>
                    </div>
                ))}

                {leaderboard.length > maxEntries && (
                    <div className="text-center pt-1">
                        <p
                            className={compact ? 'text-xs' : 'text-xs'}
                            style={{ color: 'var(--neutral-600)' }}
                        >
                            +{leaderboard.length - maxEntries} more contributors
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProjectLeaderboard;