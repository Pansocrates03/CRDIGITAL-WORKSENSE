import React from 'react';
import styles from './NewProjectModal.module.css';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectName: string, region: string) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [projectName, setProjectName] = React.useState('');
  const [region, setRegion] = React.useState('Guadalajara');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(projectName, region);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>New Project</h2>
          <p className={styles.modalDescription}>
            Your project will count with it's own space in disk and will be completely separated with any other project.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="projectName">Project name</label>
            <div className={styles.inputWrapper}>
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name"
              />
              <button 
                type="button" 
                className={styles.clearButton}
                onClick={() => setProjectName('')}
              >
                ✕
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="region">Region</label>
            <div className={styles.selectWrapper}>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="Guadalajara">Guadalajara</option>
                <option value="Mexico City">Mexico City</option>
                <option value="Monterrey">Monterrey</option>
              </select>
            </div>
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
              className={styles.startButton}
            >
              Start
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 