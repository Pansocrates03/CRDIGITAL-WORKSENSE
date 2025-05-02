import React, { useState } from "react";
import styles from "./NewProjectModal.module.css";
import { User } from "../../types/UserType";
import Member from "../../types/MemberType";


// Define available roles
const ROLES = [
  { id: "", name: "Select Role" },
  { id: "product-owner", name: "Product Owner" },
  { id: "scrum-master", name: "Scrum Master" },
  { id: "developer", name: "Developer" },
  { id: "viewer", name: "Viewer" }
];

// Component for selecting and adding members
const MemberSelection: React.FC<{
  users: User[];
  selectedMembers: Member[];
  onAddMember: (member: Member) => void;
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
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  const handleAddMember = () => {
    if (selectedUserId && selectedRoleId) {
      const newMember: Member = {
        userId: Number(selectedUserId),
        projectRoleId: selectedRoleId,
        joinedAt: {}
      };

      onAddMember(newMember);
      setSelectedUserId("");
      setSelectedRoleId("");
    }
  };

  console.log({
    users,
    selectedMembers,
    availableUsers
  });

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
          disabled={!selectedUserId || !selectedRoleId}
        >
          +
        </button>
      </div>
      <div className={styles.membersContainer}>
        {selectedMembers.length === 0 ? (
          <div className={styles.noMembers}>No members added yet</div>
        ) : (
          selectedMembers.map((member) => {
            console.log('Looking for user:', member.userId);
            console.log('Available users:', users.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}` })));
            const user = users.find((u) => u.id === member.userId);
            console.log('Found user:', user);
            return (
              <div key={member.userId} className={styles.memberRow}>
                <span className={styles.username}>
                  {user ? `${user.firstName} ${user.lastName}` : "Unknown User"}
                </span>
                <span className={styles.memberRole}>
                  {ROLES.find(role => role.id === member.projectRoleId)?.name || "Unknown Role"}
                </span>
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
