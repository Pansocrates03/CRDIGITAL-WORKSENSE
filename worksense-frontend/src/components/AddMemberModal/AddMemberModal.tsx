import React, { useState, useRef, useEffect, useMemo } from "react";
import styles from "./AddMemberModal.module.css";
import LoadingSpinner from "../Loading/LoadingSpinner";
import MemberSelection from "../NewProjectModal/MemberSelection";
import { User } from "@/types/UserType";
import apiClient from "../../api/apiClient";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Member from "@/types/MemberType";
import { useAuth } from "@/contexts/AuthContext";


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
  title = "Add Member",
  submitButtonText = "Add Member",
}) => {
  const { user, loading } = useAuth();
  const currentUserId = user?.userId ?? -1;
  const queryClient = useQueryClient();

  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [userId, setUserId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    userId?: string;
    roleId?: string;
    members?: string;
  }>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if(!user) return null;

  // Función para obtener usuarios desde la API usando React Query
  const { isLoading: isUsersLoading, data: users = [], isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => {
        const response = await apiClient.get("/users");
        return response.data;
    },
});

    const handleAddMember = (member: Member) => {
        console.log("Adding member", member);
        setSelectedMembers((prevMembers) => {
          const updatedMembers = [...prevMembers, member];
          console.log("Selected members after adding", updatedMembers);
          return updatedMembers;
        });
      };

      const handleRemoveMember = (userId: number) => {
        setSelectedMembers(selectedMembers.filter((m) => m.userId !== userId));
        };

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

    const availableUsers = useMemo(() => {
      return users.filter(
          (user) =>
          user.userId !== currentUserId &&
          !selectedMembers.some((member) => member.userId === user.userId)
      );
      }, [users, selectedMembers, currentUserId]);



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



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (true) {
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
          <MemberSelection
              users={users}
              selectedMembers={selectedMembers}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              isLoading={isUsersLoading}
              error={errors.members}
              availableUsers={availableUsers}
            />

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
