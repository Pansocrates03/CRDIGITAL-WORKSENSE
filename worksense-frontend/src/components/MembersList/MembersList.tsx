// src/components/MembersList/MembersList.tsx

import React from 'react';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { useMembers } from '@/hooks/useMembers'; // Corrected path
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";

import styles from './MembersList.module.css';

interface MembersListProps {
  projectId: string;
}

const MembersList: React.FC<MembersListProps> = ({ projectId }) => {
  const { data: members = [], isLoading, isError } = useMembers(projectId); // notice = []

  const handleEdit = (id: number) => {
    console.log(`Editing member with ID: ${id}`);
  };

  const handleDelete = (id: number) => {
    console.log(`Deleting member with ID: ${id}`);
  };

  if (isLoading) {
    return <div>Loading members...</div>;
  }

  if (isError) {
    return <div>Error loading members.</div>;
  }

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
                  {/* Temporary profile picture */}
                  <img 
                    src={`https://placecats.com/50/50`} 
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
                <TableCell>--</TableCell> {/* Placeholder for Last Login */}
                <TableCell className={styles.actionButtons}>
                  <button onClick={() => handleEdit(member.userId)} className={styles.button}>
                    <FaPencilAlt />
                  </button>
                  <button onClick={() => handleDelete(member.userId)} className={`${styles.button} ${styles.trashButton}`}>
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
