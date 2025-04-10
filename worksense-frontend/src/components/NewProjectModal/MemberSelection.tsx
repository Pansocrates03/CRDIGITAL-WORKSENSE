import React, { useState } from "react";
import styles from "./NewProjectModal.module.css";
import { User, ProjectMember } from "../../types";

// Define available roles
const ROLES = [{ id: "admin", name: "Admin" }];

// Component for selecting and adding members
const MemberSelection: React.FC<{
  users: User[];
  selectedMembers: ProjectMember[];
  onAddMember: (member: ProjectMember) => void;
  onRemoveMember: (userId: number) => void;
  isLoading: boolean;
  error?: string;
  availableUsers: User[];
}> = ({
  users,
  selectedMembers,
  onAddMember,
  onRemoveMember,
  isLoading,
  error,
  availableUsers,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("admin");

  const handleAddMember = () => {
    if (selectedUserId) {
      const newMember: ProjectMember = {
        userId: parseInt(selectedUserId),
        roleId: selectedRoleId,
      };

      onAddMember(newMember);
      setSelectedUserId("");
      setSelectedRoleId("admin");
    }
  };

  return (
    <div className={styles.formGroup}>
      <label>Project Members</label>
      <div className={styles.memberControls}>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className={styles.memberSelect}
          disabled={isLoading}
        >
          <option value="">Select a user</option>
          {availableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {`${user.firstName} ${user.lastName}`}
            </option>
          ))}
        </select>
        <select
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          className={styles.roleSelect}
          disabled={isLoading}
        >
          {ROLES.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={styles.addButton}
          onClick={handleAddMember}
          disabled={!selectedUserId}
        >
          +
        </button>
      </div>
      <div className={styles.membersContainer}>
        {selectedMembers.length === 0 ? (
          <div className={styles.noMembers}>No members added yet</div>
        ) : (
          selectedMembers.map((member) => {
            const user = users.find((u) => u.id === member.userId);
            return (
              <div key={member.userId} className={styles.memberRow}>
                <span className={styles.username}>
                  {user ? `${user.firstName} ${user.lastName}` : "Unknown User"}
                </span>
                <span className={styles.memberRole}>Admin</span>
                <button
                  type="button"
                  className={styles.removeMember}
                  onClick={() => onRemoveMember(member.userId)}
                >
                  Remove
                </button>
              </div>
            );
          })
        )}
      </div>
      {error && (
        <p className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default MemberSelection;
