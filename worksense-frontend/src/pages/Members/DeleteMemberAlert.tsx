import React from "react";
import styles from "./MembersAlert.module.css";

interface DeleteMemberAlertProps {
  memberName: string;
  onClose: () => void;
  onDelete: () => void;
}

export const DeleteMemberAlert: React.FC<DeleteMemberAlertProps> = ({
  memberName,
  onClose,
  onDelete,
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.alertContainer}>
        <div className={`${styles.icon} ${styles.error}`}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h2 className={styles.title}>Delete Member</h2>
        <p className={styles.message}>
          Are you sure you want to remove {memberName} from this project?
        </p>
        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.closeButton}`}
            onClick={onClose}
          >
            Close
          </button>
          <button
            className={`${styles.button} ${styles.actionButton}`}
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}; 