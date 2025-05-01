// src/components/ui/DeleteConfirmationModal.tsx
import React from "react";
import { AlertTriangle, X } from "lucide-react";
import styles from "@/components/BacklogTable/CreateItemModal.module.css"; // Reuse the same styles

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
  // If the modal is not open, don't render anything
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
        style={{ maxWidth: "500px" }} // Smaller than the create modal
      >
        <div className={styles.modalHeader}>
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-[#ac1754] mr-2" />
            <h2 className="font-semibold">{title}</h2>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-6 text-gray-600 dark:text-gray-300">
          <p>{message}</p>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            <X size={16} className="mr-1" />
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-[#ac1754] hover:bg-[#8e0e3d] text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
