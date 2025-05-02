import React, { useState, useEffect } from 'react';
import styles from './EditTeamModal.module.css';
import apiClient from '../../api/apiClient';

import { AvatarDisplay } from "../ui/AvatarDisplay";
import MemberDetailed from '@/types/MemberDetailedType';

// Add helper function for generating avatars
const generateAvatar = (firstName: string, lastName: string) => {
  const name = `${firstName} ${lastName}`.trim();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
};

interface User {
  id: number;
  name: string;
  avatar: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentTeam: MemberDetailed[];
  onTeamUpdate: (newTeam: MemberDetailed[]) => void;
}

const EditTeamModal: React.FC<EditTeamModalProps> = ({
  isOpen,
  onClose,
  projectId,
  currentTeam,
  onTeamUpdate,
}) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('/users');
        // Filter out users that are already in the team
        const filteredUsers = response.data.filter(
          (user: User) => !currentTeam.some(member => member.userId === user.id)
        );
        setAvailableUsers(filteredUsers);
        if (filteredUsers.length > 0) {
          setSelectedUserId(filteredUsers[0].id);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load available users. Please try again.');
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, currentTeam]);

  const handleAddMember = async () => {
    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const selectedUser = availableUsers.find(user => user.id === selectedUserId);
      if (!selectedUser) return;

      const response = await apiClient.post(`/projects/${projectId}/members`, {
        userId: selectedUserId,
        roleId: 'admin'
      });

      const newMember: MemberDetailed = {
        userId: selectedUser.id,
        name: `${selectedUser.firstName} ${selectedUser.lastName}`,
        projectRoleId: 'Team Member',
        profilePicture: generateAvatar(selectedUser.firstName, selectedUser.lastName),
        email: selectedUser.email,
        joinedAt: {
          _seconds: Math.floor(Date.now() / 1000),
          _nanoseconds: 0,
        },
        lastLogin: ""
      };
      
      onTeamUpdate([...currentTeam, newMember]);
      setSelectedUserId('');
      onClose();
    } catch (err) {
      setError('Failed to add team member. Please try again.');
      console.error('Error adding team member:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Add Team Member</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.addMemberForm}>
            <div className={styles.formGroup}>
              <label htmlFor="userId">Select User</label>
              <select
                id="userId"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                className={styles.select}
                disabled={availableUsers.length === 0}
              >
                {availableUsers.length === 0 ? (
                  <option value="">No available users</option>
                ) : (
                  availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {`${user.firstName} ${user.lastName}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="role">Role</label>
              <input
                type="text"
                id="role"
                value="Admin"
                disabled
                className={styles.input}
              />
              <small className={styles.helpText}>Currently, only Admin role is available</small>
            </div>
          </div>

          <div className={styles.currentTeam}>
            <h3>Current Team Members</h3>
            <div className={styles.teamList}>
              {currentTeam.map(member => (
                <div key={member.userId} className={styles.teamMember}>
                  <AvatarDisplay 
                    user={{
                      name: member.name,
                      profilePicture: member.profilePicture
                    }}
                    size="sm"
                  />
                  <div className={styles.memberInfo}>
                    <span className={styles.memberName}>{member.name}</span>
                    <span className={styles.memberRole}>{member.projectRoleId}</span>
                    {member.email && <span className={styles.memberEmail}>{member.email}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.saveButton}
            onClick={handleAddMember}
            disabled={loading || !selectedUserId || availableUsers.length === 0}
          >
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTeamModal; 