import React, { useState, useRef, useEffect } from "react";
import styles from "./AddMemberModal.module.css";
import LoadingSpinner from "../Loading/LoadingSpinner";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setIsSubmitting(true);
      try {
        onSubmit(userId, roleId);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label htmlFor="userId" className={styles.label}>
              User
            </label>
            <input
              ref={inputRef}
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className={styles.input}
              placeholder="Enter user ID"
              disabled={isSubmitting}
            />
            {errors.userId && (
              <p className={styles.errorMessage}>{errors.userId}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="roleId" className={styles.label}>
              Role
            </label>
            <input
              id="roleId"
              type="text"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className={styles.input}
              placeholder="Enter role ID"
              disabled={isSubmitting}
            />
            {errors.roleId && (
              <p className={styles.errorMessage}>{errors.roleId}</p>
            )}
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoadingSpinner size="small" text="Adding member..." />
              ) : (
                submitButtonText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
