// src/components/MembersList/MembersList.tsx

import React from 'react';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import styles from './MembersList.module.css';
import MemberDetailed from '@/types/MemberDetailedType';

const formatRoleName = (roleId: string) => {
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

const getInitials = (name: string) => {
  const parts = name.split(' ');
  return parts.length > 1 
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : parts[0][0];
};

interface Props {
  projectId: string;
  members: MemberDetailed[];
  onEdit?: (member: MemberDetailed) => void;
  onDelete?: (member: MemberDetailed) => void;
}

const MembersList: React.FC<Props> = ({ members, onEdit, onDelete }) => {
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
                  <div className={styles.pfpContainer}>
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt={member.name}
                        className={styles.pfp}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const initials = target.nextElementSibling as HTMLElement;
                          if (initials) initials.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className={styles.avatarInitials}>
                        {getInitials(member.name)}
                      </div>
                    )}
                  </div>
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
                <TableCell>
                  <div className={styles.actionButtons}>
                    {onEdit && (
                      <button onClick={() => onEdit(member)} className={styles.button}>
                        <FaPencilAlt />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(member)}
                        className={`${styles.button} ${styles.trashButton}`}
                      >
                        <FaTrashAlt />
                      </button>
                    )}
                  </div>
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
