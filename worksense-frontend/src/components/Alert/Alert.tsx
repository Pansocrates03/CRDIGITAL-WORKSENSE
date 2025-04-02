import React from 'react';
import styles from './Alert.module.css';

interface AlertProps {
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  type, 
  title, 
  message, 
  onClose, 
  onAction, 
  actionLabel 
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.alertContainer}>
        <div className={`${styles.icon} ${styles[type]}`}>
          {type === 'success' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
            </svg>
          )}
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button 
            className={`${styles.button} ${styles.closeButton}`}
            onClick={onClose}
          >
            Close this window
          </button>
          {actionLabel && onAction && (
            <button 
              className={`${styles.button} ${styles.actionButton}`}
              onClick={onAction}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 