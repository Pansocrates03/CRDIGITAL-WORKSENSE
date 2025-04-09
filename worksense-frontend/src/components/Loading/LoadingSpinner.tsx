import React from "react";
import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  /** Text to display below the spinner */
  text?: string;
  /** Optional subtext for additional context */
  subtext?: string;
  /** Size of the spinner - 'small', 'medium', or 'large' */
  size?: "small" | "medium" | "large";
  /** Full screen overlay when true */
  fullScreen?: boolean;
  /** Custom class name for the container */
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = "Loading",
  subtext,
  size = "medium",
  fullScreen = false,
  className = "",
}) => {
  const containerClass = fullScreen
    ? `${styles.fullScreenContainer} ${className}`
    : `${styles.container} ${className}`;

  const spinnerClass =
    styles[`spinner${size.charAt(0).toUpperCase() + size.slice(1)}`];

  return (
    <div className={containerClass} data-testid="loading-spinner">
      <div className={`${styles.spinner} ${spinnerClass}`}></div>
      {text && <p className={styles.text}>{text}</p>}
      {subtext && <p className={styles.subtext}>{subtext}</p>}
    </div>
  );
};

export default LoadingSpinner;
