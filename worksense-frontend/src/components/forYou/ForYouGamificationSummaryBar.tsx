import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/utils/forYouUtils';

interface ForYouGamificationSummaryBarProps {
  name: string;
  points: number;
  profilePicture?: string | null;
  dropdownOpen: boolean;
  onToggleDropdown: () => void;
}

const ForYouGamificationSummaryBar: React.FC<ForYouGamificationSummaryBarProps> = ({
  name,
  points,
  profilePicture,
  dropdownOpen,
  onToggleDropdown,
}) => {
  return (
    <div
      className="w-full border-b border-neutral-200 bg-white flex items-center justify-between px-6 py-3 cursor-pointer shadow-sm rounded-xl"
      onClick={onToggleDropdown}
      style={{ minHeight: 64 }}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={typeof profilePicture === 'string' && profilePicture ? profilePicture : undefined} alt="Profile" />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-lg text-foreground">{name}</span>
        <span className="text-[var(--accent-pink)] font-bold text-lg">{points} pts</span>
      </div>
      <span className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg></span>
    </div>
  );
};

export default ForYouGamificationSummaryBar; 