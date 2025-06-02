import React from 'react';
import { CheckCircle, Award, Target, Clock } from 'lucide-react';
import { useProjectActivity } from '@/hooks/useProjectActivity';

interface ActivityFeedProps {
    projectId: string;
    limit?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ projectId, limit = 5 }) => {
    const { data: activities, isLoading } = useProjectActivity(projectId, limit);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'task_completion':
                return <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />;
            case 'badge_earned':
                return <Award className="w-4 h-4" style={{ color: 'var(--accent-pink)' }} />;
            default:
                return <Target className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />;
        }
    };

    const getActivityText = (activity: any) => {
        switch (activity.type) {
            case 'task_completion':
                return (
                    <>
                        <strong style={{ color: 'var(--accent-pink)' }}>{activity.user}</strong>
                        {' completed '}
                        <span style={{ color: 'var(--text-primary)' }}>{activity.data.itemTitle}</span>
                    </>
                );
            case 'badge_earned':
                return (
                    <>
                        <strong style={{ color: 'var(--accent-pink)' }}>{activity.user}</strong>
                        {' earned '}
                        <span style={{ color: 'var(--text-primary)' }}>{activity.data.badgeName}</span>
                        {' badge'}
                    </>
                );
            default:
                return `${activity.user} performed an action`;
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: 'var(--neutral-300)' }}
                        ></div>
                        <div className="flex-1">
                            <div
                                className="h-4 rounded w-3/4 mb-1"
                                style={{ backgroundColor: 'var(--neutral-300)' }}
                            ></div>
                            <div
                                className="h-3 rounded w-1/2"
                                style={{ backgroundColor: 'var(--neutral-200)' }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!activities || activities.length === 0) {
        return (
            <div
                className="text-center py-8"
                style={{ color: 'var(--neutral-600)' }}
            >
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {activities.map((activity: any, index: number) => (
                <div
                    key={index}
                    className="flex gap-3 p-3 rounded-lg transition-colors"
                    style={{ backgroundColor: 'var(--surface-light)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--surface-light-hover)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--surface-light)';
                    }}
                >
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {getActivityText(activity)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" style={{ color: 'var(--neutral-500)' }} />
                            <span
                                className="text-xs"
                                style={{ color: 'var(--neutral-600)' }}
                            >
                {getTimeAgo(activity.timestamp)}
              </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityFeed;