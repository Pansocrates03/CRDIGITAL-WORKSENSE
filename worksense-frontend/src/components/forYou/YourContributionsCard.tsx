import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getStandingMessage } from '@/utils/forYouUtils';

interface LeaderboardEntry {
  userId: number;
  points: number;
  name: string;
  avatarUrl: string | null;
  rank: number;
}

interface YourContributionsCardProps {
  assignedCount: number;
  completedCount: number;
  leaderboardData?: LeaderboardEntry[];
  userId?: number;
}


const YourContributionsCard: React.FC<YourContributionsCardProps> = ({ assignedCount, completedCount, leaderboardData, userId }) => {
  let rank: number | undefined;
  let message = '';
  if (leaderboardData && userId) {
    const userEntry = leaderboardData.find(entry => entry.userId === userId);
    if (userEntry) {
      rank = userEntry.rank;
      message = getStandingMessage(rank);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your contributions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 items-center justify-center py-2">
          <div className="flex flex-col gap-1 items-center">
            <span className="text-2xl font-bold text-[var(--accent-pink)]">{assignedCount}</span>
            <span className="text-sm text-muted-foreground">Tasks Assigned</span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <span className="text-2xl font-bold text-[var(--accent-pink)]">{completedCount}</span>
            <span className="text-sm text-muted-foreground">Tasks Completed</span>
          </div>
          {rank !== undefined && (
            <div className="flex flex-col gap-1 items-center mt-2">
              <span className="text-lg font-semibold">Leaderboard Standing: <span className="text-[var(--accent-pink)]">#{rank}</span></span>
              <span className="text-sm text-muted-foreground text-center">{message}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default YourContributionsCard; 