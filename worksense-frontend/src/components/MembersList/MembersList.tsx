import React from 'react';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table"; // Adjust this path if needed

import styles from './MembersList.module.css'; // Keep using your CSS

interface Member {
  id: number;
  pfp: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
}

const members: Member[] = [
  {
    id: 1,
    pfp: 'https://placecats.com/50/50',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Administrator',
    lastLogin: '2 hours ago'
  },
  {
    id: 2,
    pfp: 'https://placecats.com/51/51',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Editor',
    lastLogin: '1 day ago'
  },
];

const MembersList: React.FC = () => {
  const handleEdit = (id: number) => {
    console.log(`Editing member with ID: ${id}`);
  };

  const handleDelete = (id: number) => {
    console.log(`Deleting member with ID: ${id}`);
  };

  return (
    <div className={styles.membersListContainer}>
      <div className={styles.tableContainer}>
        <Table className={styles.table}>
          <TableHeader className="">
            <TableRow className="">
              <TableHead className="bg-[#f9fafb] text-[#666] text-[0.75rem] font-semibold uppercase">
                PFP
              </TableHead>
              <TableHead className="bg-[#f9fafb] text-[#666] text-[0.75rem] font-semibold uppercase">
                Name
              </TableHead>
              <TableHead className="bg-[#f9fafb] text-[#666] text-[0.75rem] font-semibold uppercase">
                Email
              </TableHead>
              <TableHead className="bg-[#f9fafb] text-[#666] text-[0.75rem] font-semibold uppercase">
                Role
              </TableHead>
              <TableHead className="bg-[#f9fafb] text-[#666] text-[0.75rem] font-semibold uppercase">
                Last Login
              </TableHead>
              <TableHead className="bg-[#f9fafb] text-[#666] text-[0.75rem] font-semibold uppercase">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow 
                key={member.id}
                className="hover:bg-[#f7f7f7]"
              >
                <TableCell>
                  <img src={member.pfp} alt={member.name} className={styles.pfp} />
                </TableCell>
                <TableCell className="text-[#222] text-[0.875rem]">{member.name}</TableCell>
                <TableCell className="text-[#222] text-[0.875rem]">{member.email}</TableCell>
                <TableCell>
                  <span className={`${styles.badge} ${styles.roleBadge}`}>
                    {member.role}
                  </span>
                </TableCell>
                <TableCell className="text-[#222] text-[0.875rem]">{member.lastLogin}</TableCell>
                <TableCell className={styles.actionButtons}>
                  <button 
                    onClick={() => handleEdit(member.id)} 
                    className={styles.button}
                  >
                    <FaPencilAlt />
                  </button>
                  <button 
                    onClick={() => handleDelete(member.id)} 
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
