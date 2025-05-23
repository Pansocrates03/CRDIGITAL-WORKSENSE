// src/components/MembersList/MembersList.tsx

import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
import {AvatarDisplay} from '@/components/ui/AvatarDisplay';
import styles from './MembersList.module.css';
import MemberDetailed from '@/types/MemberDetailedType';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {MoreVertical} from "lucide-react";

const formatRoleName = (roleId: any) => {
    if (!roleId) return 'Unknown Role';
    return roleId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const formatLastLogin = (dateString: string) => {
    if (!dateString) return '--';

    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    const timeString = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    if (diffInDays === 0) {
        return `Today at ${timeString}`;
    } else if (diffInDays === 1) {
        return `Yesterday at ${timeString}`;
    } else if (diffInDays < 7) {
        return `${diffInDays} days ago at ${timeString}`;
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
};

interface Props {
    projectId: string;
    members: MemberDetailed[];
    onEdit?: (member: MemberDetailed) => void;
    onDelete?: (member: MemberDetailed) => void;
}

const MembersList: React.FC<Props> = ({members, onEdit, onDelete}) => {
    return (
        <div className={styles.membersListContainer}>
            <div className={styles.tableContainer}>
                <Table className={styles.table}>
                    <TableHeader>
                        <TableRow>
                            <TableHead>PFP</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.userId}>
                                <TableCell>
                                    <AvatarDisplay
                                        user={{
                                            name: member.name,
                                            profilePicture: member.profilePicture
                                        }}
                                        size="sm"
                                    />
                                </TableCell>
                                <TableCell>{member.name}</TableCell>
                                <TableCell>{member.email}</TableCell>
                                <TableCell>
                  <span className={`${styles.badge} ${styles.roleBadge}`}>
                    {formatRoleName(member.projectRoleId)}
                  </span>
                                </TableCell>
                                <TableCell>
                  <span className={styles.lastLogin}>
                    {formatLastLogin(member.lastLogin)}
                  </span>
                                </TableCell>
                                <TableCell className="py-2"> {/* Add vertical padding to the cell */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="inline-flex items-center justify-center p-3 rounded-md hover:bg-neutral-100 hover:text-[var(--accent-pink)]  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 data-[state=open]:bg-neutral-100 data-[state=open]:text-[var(--accent-pink)]"
                                                aria-label="Actions"
                                            >
                                                <MoreVertical
                                                    className="h-4 w-4text-[var(--text-primary)]"/> {/* Icon size and color */}
                                            </button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            className="w-40 bg-white border-neutral-50 z-50">
                                            {onEdit && (
                                                <DropdownMenuItem

                                                    onClick={() => onEdit(member)}
                                                    className="flex items-center px-2 py-1.5 text-sm text-[var(--text-primary)] cursor-pointer data-[highlighted]:bg-neutral-50 data-[highlighted]:text-[#ac1754] rounded-sm" // Using the configured color
                                                >
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                            )}
                                            {onDelete && (
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(member)}
                                                    className="flex items-center px-2 py-1.5 text-sm text-[var(--text-primary)] cursor-pointer data-[highlighted]:bg-neutral-50 data-[highlighted]:text-[#ac1754] rounded-sm outline-none"
                                                >
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default MembersList;
