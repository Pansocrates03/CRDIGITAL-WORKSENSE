import React, {useState} from "react";
import styles from "./NewProjectModal.module.css";
import {User} from "../../types/UserType";
import Member from "../../types/MemberType";


// Define available roles
const ROLES = [
    {id: "product-owner", name: "Product Owner"},
    {id: "scrum-master", name: "Scrum Master"},
    {id: "developer", name: "Developer"},
    {id: "viewer", name: "Viewer"}
];

// Component for selecting and adding members
const MemberSelection: React.FC<{
    users: User[];
    selectedMembers: Member[];
    onAddMember: (member: Member) => void;
    onRemoveMember: (userId: string) => void;
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
    const [validationError, setValidationError] = useState<string>("");

    const handleAddMember = () => {
        if (!selectedUserId) {
            setValidationError("Please select a user");
            return;
        }
        if (!selectedRoleId) {
            setValidationError("Please select a role");
            return;
        }

        setValidationError("");
        const newMember: Member = {
            userId: selectedUserId,
            projectRoleId: selectedRoleId,
            joinedAt: {
                _seconds: Math.floor(Date.now() / 1000),
                _nanoseconds: 0
            },
            updatedAt: {
                _seconds: Math.floor(Date.now() / 1000),
                _nanoseconds: 0
            }
        };

        onAddMember(newMember);
        setSelectedUserId("");
        setSelectedRoleId("");
    };

    console.log({
        users,
        selectedMembers,
        availableUsers
    });

    return (
        <div className={styles.formGroup}>
            <div className={styles.memberControls}>
                <select
                    value={selectedUserId}
                    onChange={(e) => {
                        setSelectedUserId(e.target.value);
                        setValidationError("");
                    }}
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
                    onChange={(e) => {
                        setSelectedRoleId(e.target.value);
                        setValidationError("");
                    }}
                    className={styles.roleSelect}
                    disabled={isLoading}
                >
                    <option value="">Select a role</option>
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
                    disabled={isLoading}
                >
                    +
                </button>
            </div>
            {(validationError || error) && (
                <p className={styles.errorMessage} role="alert">
                    {validationError || error}
                </p>
            )}
            <div className={styles.membersContainer}>
                {selectedMembers.length === 0 ? (
                    <div className={styles.noMembers}>No members added yet</div>
                ) : (
                    selectedMembers.map((member) => {
                        console.log('Looking for user:', member.userId);
                        console.log('Available users:', users.map(u => ({
                            id: u.id,
                            name: `${u.firstName} ${u.lastName}`
                        })));
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
        </div>
    );
};

export default MemberSelection;
