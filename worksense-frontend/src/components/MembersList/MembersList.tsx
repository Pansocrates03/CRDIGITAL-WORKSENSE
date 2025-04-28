import React from 'react';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import styles from './MembersList.module.css'; // Import updated CSS file

interface Member {
  id: number;
  pfp: string;  // URL of profile picture
  name: string;
  email: string;
  role: string;
  lastLogin: string; // Date string or time ago
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
  // Add more members as needed
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
        <table className={styles.table}>
          <thead>
            <tr>
              <th>PFP</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  <img src={member.pfp} alt={member.name} className={styles.pfp} />
                </td>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>
                  <span className={`${styles.badge} ${styles.roleBadge}`}>{member.role}</span>
                </td>
                <td>{member.lastLogin}</td>
                <td className={styles.actionButtons}>
                    <button onClick={() => handleEdit(member.id)} className={styles.button}>
                    <FaPencilAlt />
                    </button>
                    
                    <button 
                    onClick={() => handleDelete(member.id)} 
                    className={`${styles.button} ${styles.trashButton}`}
                    >
                    <FaTrashAlt />
                </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembersList;
