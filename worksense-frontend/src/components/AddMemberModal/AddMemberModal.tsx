import React, { useState, useRef, useEffect } from "react";
import styles from "./AddMemberModal.module.css";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userId: string, roleId: string) => void;
  projectId: string;
  title?: string;
  submitButtonText?: string;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  title = "Add Member",
  submitButtonText = "Add Member",
}) => {
  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [errors, setErrors] = useState<{
    userId?: string;
    roleId?: string;
  }>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset form when opening and auto-focus the input
  useEffect(() => {
    if (isOpen) {
      setUserId("");
      setRoleId("");
      setErrors({});

      // Focus the input after a short delay to ensure the modal is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: { userId?: string; roleId?: string } = {};

    if (!userId.trim()) {
      newErrors.userId = "User ID is required";
    }

    if (!roleId.trim()) {
      newErrors.roleId = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(userId.trim(), roleId.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modalContent} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2 id="modal-title">{title}</h2>
          <p className={styles.modalDescription}>
            Add a new member to your project. They will be able to collaborate
            based on their assigned role.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="userId">User ID</label>
            <div className={styles.inputWrapper}>
              <input
                id="userId"
                ref={inputRef}
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  if (errors.userId) {
                    setErrors({ ...errors, userId: undefined });
                  }
                }}
                placeholder="Enter user ID"
                aria-required="true"
                aria-invalid={!!errors.userId}
              />
            </div>
            {errors.userId && (
              <p className={styles.errorMessage} role="alert">
                {errors.userId}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="roleId">Role</label>
            <div className={styles.inputWrapper}>
              <input
                id="roleId"
                type="text"
                value={roleId}
                onChange={(e) => {
                  setRoleId(e.target.value);
                  if (errors.roleId) {
                    setErrors({ ...errors, roleId: undefined });
                  }
                }}
                placeholder="Enter role ID"
                aria-required="true"
                aria-invalid={!!errors.roleId}
              />
            </div>
            {errors.roleId && (
              <p className={styles.errorMessage} role="alert">
                {errors.roleId}
              </p>
            )}
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.addButton}
              disabled={!userId.trim() || !roleId.trim()}
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
