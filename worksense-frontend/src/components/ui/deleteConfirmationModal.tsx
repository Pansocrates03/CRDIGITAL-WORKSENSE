// src/components/ui/DeleteConfirmationModal.tsx
import React from "react";
import styles from "@/components/BacklogTable/CreateItemModal.module.css"; // Reuse the same styles
import {Button} from "@/components/ui/button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "500px" }}
      >
        <div className={styles.modalHeader}>
          <div className="flex items-center">
            <h2 className="font-semibold">{title}</h2>
          </div>
        </div>

        <div className=" p-5 my-6 text-sm text-gray-600 dark:text-gray-300">
          <p>{message}</p>
        </div>

        <div className={styles.formActions}>
          <Button variant = {"secondary"}
            type="button"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant ={"destructive"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
