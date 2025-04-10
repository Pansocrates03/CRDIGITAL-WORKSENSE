import React from "react";
import styles from "./NewProjectModal.module.css";

// Component for progress bar display during backlog population
const BacklogProgress: React.FC<{
  progress: number;
}> = ({ progress }) => (
  <div className={styles.populatingContainer}>
    <h2>Creating your backlog with AI</h2>
    <div className={styles.loaderContainer}>
      <div className={styles.progressBarContainer}>
        <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.statusText}>
        {progress < 30
          ? "Analyzing project details..."
          : progress < 60
          ? "Generating epics and user stories..."
          : progress < 90
          ? "Organizing priorities..."
          : "Finalizing backlog..."}
      </div>
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
      </div>
    </div>
  </div>
);

export default BacklogProgress;
