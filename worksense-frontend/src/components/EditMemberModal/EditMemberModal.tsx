// src/components/MembersList/EditMemberModal.tsx

import React, { useEffect, useState } from 'react';
import styles from './EditMemberModal.module.css';
import { ProjectMember } from '@/types/ProjectMemberType';

interface Role {
  id: string;
  name: string;
}

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: ProjectMember | null;
  availableRoles: Role[];
  onSubmit: (userId: string, roleId: string) => void;
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  availableRoles,
  onSubmit,
}) => {
  const [roleId, setRoleId] = useState('');

  useEffect(() => {
    if (member) {
      setRoleId(member.projectRoleId);
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (member && roleId) {
      onSubmit(member.userId, roleId);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Member</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Name</label>
            <input type="text" value={member.user.firstName + ' ' + member.user.lastName}  disabled className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input type="email" value={member.user.email} disabled className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Role</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className={styles.select}
            >
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMemberModal;
