import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface AvatarDisplayProps {
  user: {
    firstName?: string;
    lastName?: string;
    name?: string;
    profilePicture?: string;
    avatarUrl?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const getInitials = (user: AvatarDisplayProps['user']): string => {
  // If we have firstName and lastName, use those
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  
  // If we have a full name, split it and use first letters
  if (user.name) {
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    // If only one word name, use first two letters
    return user.name.slice(0, 2).toUpperCase();
  }

  // Fallback
  return '??';
};

const sizeClasses = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
  xl: 'size-16'
};

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ 
  user, 
  size = 'md',
  className = ''
}) => {
  const avatarUrl = user.profilePicture || user.avatarUrl;
  const initials = getInitials(user);

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {avatarUrl ? (
        <AvatarImage 
          src={avatarUrl} 
          alt={user.name || `${user.firstName} ${user.lastName}`}
        />
      ) : (
        <AvatarFallback>
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

// For group avatars (like in project cards or team displays)
interface AvatarGroupProps {
  users: AvatarDisplayProps['user'][];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  maxVisible = 3,
  size = 'sm'
}) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  return (
    <div className="flex -space-x-2">
      {visibleUsers.map((user, index) => (
        <AvatarDisplay
          key={index}
          user={user}
          size={size}
          className="border-2 border-background"
        />
      ))}
      {remainingCount > 0 && (
        <Avatar className={`${sizeClasses[size]} border-2 border-background bg-muted`}>
          <AvatarFallback>+{remainingCount}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}; 