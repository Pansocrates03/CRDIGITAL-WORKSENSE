import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown } from 'lucide-react';

interface ForYouGamificationSummaryProps {
  name: string;
  points: number;
  profilePicture?: string | null;
  onClick?: () => void;
}

function getInitials(name: string) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const ForYouGamificationSummary: React.FC<ForYouGamificationSummaryProps> = ({ name, points, profilePicture, onClick }) => {
  return (
    <button
      className="flex items-center gap-3 px-3 py-2 rounded-lg border border-neutral-200 bg-white shadow-sm hover:bg-neutral-50 transition cursor-pointer"
      onClick={onClick}
      type="button"
      aria-label="Show gamification details"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={typeof profilePicture === 'string' && profilePicture.length > 0 ? profilePicture : undefined} alt="Profile" />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <span className="font-semibold text-base text-foreground">{name}</span>
      <span className="text-[var(--accent-pink)] font-bold text-base">{points} pts</span>
      <ChevronDown className="w-5 h-5 text-muted-foreground ml-1" />
    </button>
  );
};

export default ForYouGamificationSummary; 