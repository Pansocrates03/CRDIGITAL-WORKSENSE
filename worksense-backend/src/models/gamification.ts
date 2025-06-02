export interface Badge {
  earnedAt: string;
  icon: string;
  name: string;
  points: number;
  projectId: string;
}

export interface LeaderboardEntry {
  badges: Badge[];
  points: number;
  name: string;
  lastUpdate?: string | null;
  personalPhrase?: string | null;
  profilePicture?: string | null;
} 