import React from "react";
import styles from "./Alert.module.css";

interface AlertProps {
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
  className?: Record<string, string>;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  onAction,
  actionLabel,
  className,
}) => {
  return (
    <div className={className?.overlay}>
      <div className={className?.alertContainer}>
        <div className={`${className?.icon} ${className?.[type]}`}>
          {type === "success" ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="currentColor"
              />
            </svg>
          ) : (
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
          )}
        </div>
        <h2 className={className?.title}>{title}</h2>
        <p className={className?.message}>{message}</p>
        <div className={className?.actions}>
          <button
            className={`${className?.button} ${className?.closeButton}`}
            onClick={onClose}
          >
            Close
          </button>
          {actionLabel && onAction && (
            <button
              className={`${className?.button} ${className?.actionButton}`}
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
