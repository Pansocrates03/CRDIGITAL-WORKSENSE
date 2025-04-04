import React from 'react';
import styles from './NewProjectModal.module.css';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectName: string, description: string) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [projectName, setProjectName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(projectName, description);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    // Reset height to auto to properly calculate scroll height
    e.target.style.height = 'auto';
    // Set new height based on scroll height
    e.target.style.height = `${e.target.scrollHeight}px`;
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
            <label htmlFor="description">Description</label>
            <div className={styles.textareaWrapper}>
              <textarea
                id="description"
                value={description}
                onChange={handleTextareaChange}
                placeholder="Project Description"
                rows={3}
                className={styles.textarea}
              />
              <button 
                type="button" 
                className={styles.clearButton}
                onClick={() => {
                  setDescription('');
                  const textarea = document.getElementById('description') as HTMLTextAreaElement;
                  if (textarea) {
                    textarea.style.height = 'auto';
                  }
                }}
              >
                ✕
              </button>
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