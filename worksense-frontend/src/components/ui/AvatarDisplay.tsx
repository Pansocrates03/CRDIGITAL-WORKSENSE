import React from 'react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import type { User } from "@/types/UserType"

interface AvatarDisplayProps {
    user: User;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const getInitials = (user: AvatarDisplayProps['user']): string => {
    // If we have firstName and lastName, use those
    if (user.firstName && user.lastName) {
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }

    // If we have a fullName, split it and use first letters
    if (user.fullName) {
        const nameParts = user.fullName.split(' ');
        if (nameParts.length >= 2) {
            return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
        }
        // If only one word name, use first two letters
        return user.fullName.slice(0, 2).toUpperCase();
    }

    // If we have email, use first two letters
    if (user.email) {
        return user.email.slice(0, 2).toUpperCase();
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
    if (!user) {
        return (
            <Avatar className={`${sizeClasses[size]} ${className}`}>
                <AvatarFallback>??</AvatarFallback>
            </Avatar>
        );
    }

    const avatarUrl = user.pfp;
    const initials = getInitials(user);
    const displayName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User';

    return (
        <Avatar className={`${sizeClasses[size]} ${className}`}>
            {avatarUrl ? (
                <AvatarImage
                    src={avatarUrl}
                    alt={displayName}
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
    if (!users || users.length === 0) {
        return null;
    }

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