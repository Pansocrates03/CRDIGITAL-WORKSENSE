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

interface Props {
  projectId: string;
  members: MemberDetailed[];
  onEdit: (member: MemberDetailed) => void;
}

const MembersList: React.FC<Props> = ({ members, onEdit }) => {
  const handleDelete = (id: number) => {
    console.log('Delete not implemented yet. Member ID:', id);
  };

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
                  <img
                    src="https://placecats.com/50/50"
                    alt={member.name}
                    className={styles.pfp}
                  />
                </TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <span className={`${styles.badge} ${styles.roleBadge}`}>
                    {member.projectRoleId}
                  </span>
                </TableCell>
                <TableCell>--</TableCell>
                <TableCell className={styles.actionButtons}>
                  <button onClick={() => onEdit(member)} className={styles.button}>
                    <FaPencilAlt />
                  </button>
                  <button
                    onClick={() => handleDelete(member.userId)}
                    className={`${styles.button} ${styles.trashButton}`}
                  >
                    <FaTrashAlt />
                  </button>
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
