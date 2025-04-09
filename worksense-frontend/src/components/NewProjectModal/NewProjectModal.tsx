import React, { useState, useRef, useEffect } from "react";
import styles from "./NewProjectModal.module.css";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectName: string, description: string) => void;
  /** Initial project name (for editing mode) */
  initialProjectName?: string;
  /** Initial project description (for editing mode) */
  initialDescription?: string;
  /** Modal title. Defaults to "New Project" */
  title?: string;
  /** Submit button text. Defaults to "Start" */
  submitButtonText?: string;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialProjectName = "",
  initialDescription = "",
  title = "New Project",
  submitButtonText = "Start",
}) => {
  const [projectName, setProjectName] = useState(initialProjectName);
  const [description, setDescription] = useState(initialDescription);
  const [errors, setErrors] = useState<{
    projectName?: string;
    description?: string;
  }>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset form when opening and auto-focus the input
  useEffect(() => {
    if (isOpen) {
      setProjectName(initialProjectName);
      setDescription(initialDescription);
      setErrors({});

      // Focus the input after a short delay to ensure the modal is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      // Adjust textarea height for initial content
      if (textareaRef.current && initialDescription) {
        adjustTextareaHeight(textareaRef.current);
      }
    }
  }, [isOpen, initialProjectName, initialDescription]);

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

  const validateForm = (): boolean => {
    const newErrors: { projectName?: string; description?: string } = {};

    if (!projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(projectName.trim(), description.trim());
      // Don't reset the form here - let the parent component control the modal
    }
  };

  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    // Reset height to auto to properly calculate scroll height
    element.style.height = "auto";
    // Set new height based on scroll height with a small buffer
    element.style.height = `${element.scrollHeight + 2}px`;
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if (errors.description) {
      setErrors({ ...errors, description: undefined });
    }
    adjustTextareaHeight(e.target);
  };

  // Clear handlers with proper focus management
  const handleClearProjectName = () => {
    setProjectName("");
    inputRef.current?.focus();
  };

  const handleClearDescription = () => {
    setDescription("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modalContent} ref={modalRef}>
        <div className={styles.modalHeader}>
          <h2 id="modal-title">{title}</h2>
          <p className={styles.modalDescription}>
            Your project will have its own dedicated space and will be
            completely separate from other projects.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="projectName">Project name</label>
            <div className={styles.inputWrapper}>
              <input
                id="projectName"
                ref={inputRef}
                type="text"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  if (errors.projectName) {
                    setErrors({ ...errors, projectName: undefined });
                  }
                }}
                placeholder="Enter project name"
                aria-required="true"
                aria-invalid={!!errors.projectName}
              />
              {projectName && (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClearProjectName}
                  aria-label="Clear project name"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              )}
            </div>
            {errors.projectName && (
              <p className={styles.errorMessage} role="alert">
                {errors.projectName}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <div className={styles.textareaWrapper}>
              <textarea
                id="description"
                ref={textareaRef}
                value={description}
                onChange={handleTextareaChange}
                placeholder="Describe your project (required)"
                rows={3}
                className={styles.textarea}
                aria-required="true"
                aria-invalid={!!errors.description}
              />
              {description && (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClearDescription}
                  aria-label="Clear description"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              )}
            </div>
            {errors.description && (
              <p className={styles.errorMessage} role="alert">
                {errors.description}
              </p>
            )}
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
              disabled={!projectName.trim() || !description.trim()}
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
