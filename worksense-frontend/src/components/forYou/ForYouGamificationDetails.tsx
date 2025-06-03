import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ProjectLeaderboard from '@/components/ui/ProjectLeaderboard';
import { Pencil, Award, Star, Rocket } from 'lucide-react';
import { getInitials } from '@/utils/forYouUtils';

const iconMap: Record<string, React.ElementType> = {
  Award,
  Star,
  Rocket,
};

interface ForYouGamificationDetailsProps {
  gamification: {
    name: string;
    points: number;
    profilePicture?: string | null;
    personalPhrase?: string | null;
    badges: { icon: string; name: string; points: number }[];
  };
  userProfile?: { avatar?: string | null };
  onEdit: () => void;
  projectId: string;
}

const ForYouGamificationDetails: React.FC<ForYouGamificationDetailsProps> = ({ gamification, userProfile, onEdit, projectId }) => {
  return (
    <div className="w-full bg-white border-b border-neutral-200 px-8 py-8 flex flex-row items-center gap-8 shadow-sm rounded-b-xl flex-wrap md:flex-nowrap">
      {/* Avatar with edit button on hover */}
      <div className="flex-shrink-0 flex justify-center w-full md:w-auto mb-4 md:mb-0 relative group">
        <Avatar className="h-24 w-24">
          <AvatarImage src={typeof (gamification.profilePicture || userProfile?.avatar) === 'string' && (gamification.profilePicture || userProfile?.avatar) ? (gamification.profilePicture || userProfile?.avatar) ?? undefined : undefined} alt="Profile" />
          <AvatarFallback>{getInitials(gamification.name)}</AvatarFallback>
        </Avatar>
        <button
          className="absolute bottom-2 right-2 bg-white border border-neutral-200 rounded-full p-2 shadow transition-opacity opacity-0 group-hover:opacity-100 hover:bg-[var(--accent-pink-light)]"
          style={{ zIndex: 2 }}
          onClick={e => { e.stopPropagation(); onEdit(); }}
          type="button"
          aria-label="Edit profile picture"
        >
          <Pencil className="w-5 h-5 text-[var(--accent-pink)]" />
        </button>
      </div>
      {/* Center: Main Info + Leaderboard */}
      <div className="flex-1 min-w-[200px] flex flex-col md:flex-row items-center md:items-stretch gap-8">
        {/* Main Info */}
        <div className="flex flex-col items-center md:items-start gap-2 flex-1">
          <div className="font-bold text-2xl md:text-xl text-center md:text-left">{gamification.name}</div>
          <div className="text-2xl font-bold text-[var(--accent-pink)] text-center md:text-left">{gamification.points} pts</div>
          <div className="mt-2 w-full flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1 text-center md:text-left">
              <span>Personal Phrase</span>
              <button
                className="p-1 rounded-full hover:bg-[var(--accent-pink-light)]"
                onClick={e => { e.stopPropagation(); onEdit(); }}
                type="button"
                aria-label="Edit personal phrase"
              >
                <Pencil className="w-4 h-4 text-[var(--accent-pink)]" />
              </button>
            </div>
            <div className="text-base font-medium text-center md:text-left">{gamification.personalPhrase || <span className="italic text-muted-foreground">No phrase set</span>}</div>
          </div>
        </div>
        {/* Divider */}
        <div className="hidden md:block w-px bg-neutral-200 mx-4" />
        {/* Leaderboard */}
        <div className="flex flex-col items-center justify-center flex-1 min-w-[180px]">
          <ProjectLeaderboard projectId={projectId} compact={true} maxEntries={3} />
        </div>
      </div>
      {/* Badges */}
      <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
        <div className="w-full md:w-auto">
          <div className="text-muted-foreground text-xs mb-2 text-center md:text-right">Badges</div>
          <div className="flex flex-wrap gap-3 justify-center md:justify-end">
            {gamification.badges.length === 0 ? (
              <span className="text-muted-foreground">No badges yet.</span>
            ) : (
              gamification.badges.map((badge, idx) => {
                const LucideIcon = iconMap[badge.icon] || Award;
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="bg-[var(--accent-pink-light)] rounded-full p-2 mb-1">
                      <LucideIcon className="w-7 h-7 text-[var(--accent-pink)]" />
                    </span>
                    <span className="text-xs font-medium">{badge.name}</span>
                    <span className="text-[10px] text-muted-foreground">+{badge.points}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForYouGamificationDetails; 