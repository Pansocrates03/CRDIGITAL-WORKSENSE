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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Stat blocks */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            {/* Assigned */}
            <div className="stat" style={{ flex: 1, alignItems: 'center', background: 'var(--surface-light)', borderRadius: 'var(--radius)', padding: 16, textAlign: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="var(--accent-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>
              <div className="statValue" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>{assignedCount}</div>
              <div className="statLabel" style={{ fontSize: 12, color: 'var(--neutral-600)', textTransform: 'uppercase', fontWeight: 500 }}>Assigned</div>
            </div>
            {/* Completed */}
            <div className="stat" style={{ flex: 1, alignItems: 'center', background: 'var(--surface-light)', borderRadius: 'var(--radius)', padding: 16, textAlign: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2l4 -4"/><circle cx="12" cy="12" r="10"/></svg>
              <div className="statValue" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>{completedCount}</div>
              <div className="statLabel" style={{ fontSize: 12, color: 'var(--neutral-600)', textTransform: 'uppercase', fontWeight: 500 }}>Completed</div>
            </div>
            {/* Completion Rate */}
            <div className="stat" style={{ flex: 1, alignItems: 'center', background: 'var(--surface-light)', borderRadius: 'var(--radius)', padding: 16, textAlign: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <div className="statValue" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>{assignedCount > 0 ? Math.round((completedCount / (assignedCount + completedCount)) * 100) : 100}%</div>
              <div className="statLabel" style={{ fontSize: 12, color: 'var(--neutral-600)', textTransform: 'uppercase', fontWeight: 500 }}>Completion</div>
              {/* Progress bar */}
              <div style={{ width: '100%', height: 6, background: 'var(--neutral-200)', borderRadius: 4, marginTop: 8 }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-pink), var(--accent-pink-hover))', borderRadius: 4, width: `${assignedCount > 0 ? Math.round((completedCount / (assignedCount + completedCount)) * 100) : 100}%`, transition: 'width 0.3s' }}></div>
              </div>
            </div>
          </div>
          {/* Leaderboard standing */}
          {rank !== undefined && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 16 }}>
              <span style={{ display: 'inline-block', background: 'var(--accent-blue)', color: 'white', borderRadius: 12, padding: '4px 16px', fontWeight: 600, fontSize: 16, marginBottom: 4 }}>#{rank} Leaderboard</span>
              <span className="text-sm text-muted-foreground text-center" style={{ color: 'var(--neutral-600)' }}>{message}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default YourContributionsCard; 