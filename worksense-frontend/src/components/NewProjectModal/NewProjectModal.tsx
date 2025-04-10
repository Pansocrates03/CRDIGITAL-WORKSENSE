import React, { useState, useRef, useEffect, useMemo } from "react";
import styles from "./NewProjectModal.module.css";
import MemberSelection from "./MemberSelection";
import InputWithClear from "./InputWithClear";
import BacklogProgress from "./BacklogProgress";
import useAutoResizeTextarea from "../../hooks/resizingTextarea";
import apiClient from "../../api/apiClient";
import {
  User,
  ProjectMember,
  FormErrors,
  NewProjectModalProps,
} from "../../types";

// Main component
const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialProjectName = "",
  initialDescription = "",
  title = "New Project",
  submitButtonText = "Start",
  currentUserId,
}) => {
  // State for form inputs
  const [projectName, setProjectName] = useState(initialProjectName);
  const [shouldPopulateBacklog, setShouldPopulateBacklog] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<ProjectMember[]>([]);

  // Description textarea with auto-resize
  const {
    value: description,
    setValue: setDescription,
    handleChange: handleTextareaChange,
    clear: handleClearDescription,
    textareaRef,
  } = useAutoResizeTextarea(initialDescription);

  // State for users and loading
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // State for form validation and submission
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // State for backlog population
  const [isPopulatingBacklog, setIsPopulatingBacklog] = useState(false);
  const [populationProgress, setPopulationProgress] = useState(0);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter available users for member selection
  const availableUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.id !== currentUserId &&
        !selectedMembers.some((member) => member.userId === user.id)
    );
  }, [users, selectedMembers, currentUserId]);

  // API calls
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await apiClient.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const populateBacklog = async (projectId: string): Promise<void> => {
    setIsPopulatingBacklog(true);
    setPopulationProgress(0);

    try {
      // Call AI service to populate the backlog
      await apiClient.post(`/projects/${projectId}/generate-epic`);

      // Set to 100% when complete
      setPopulationProgress(100);

      // Small delay before proceeding to show 100% completion
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error populating backlog:", error);
      setErrors({
        ...errors,
        members: "Failed to populate backlog. Please try again.",
      });
    } finally {
      setIsPopulatingBacklog(false);
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Event handlers
  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
    if (errors.projectName) {
      setErrors({ ...errors, projectName: undefined });
    }
  };

  const handleClearProjectName = () => {
    setProjectName("");
    inputRef.current?.focus();
  };

  const handleAddMember = (member: ProjectMember) => {
    // Check if member is already added
    if (!selectedMembers.some((m) => m.userId === member.userId)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const handleRemoveMember = (userId: number) => {
    setSelectedMembers(
      selectedMembers.filter((member) => member.userId !== userId)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsCreatingProject(true);
      try {
        // First create the project
        const projectId = await onSubmit(
          projectName.trim(),
          description.trim(),
          selectedMembers,
          shouldPopulateBacklog
        );

        setCreatedProjectId(projectId);

        // If backlog population is requested, handle it
        if (shouldPopulateBacklog) {
          await populateBacklog(projectId);
        }

        // Only close the modal after everything is complete
        onClose();
      } catch (error) {
        console.error("Error creating project:", error);
        setErrors({
          ...errors,
          members: "Failed to create project. Please try again.",
        });
      } finally {
        setIsCreatingProject(false);
      }
    }
  };

  // Effects
  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Reset form when opening and auto-focus the input
  useEffect(() => {
    if (isOpen) {
      setProjectName(initialProjectName);
      setDescription(initialDescription);
      setSelectedMembers([]);
      setErrors({});
      setIsPopulatingBacklog(false);
      setPopulationProgress(0);
      setCreatedProjectId(null);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialProjectName, initialDescription]);

  // Progress bar animation for backlog population
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPopulatingBacklog) {
      interval = setInterval(() => {
        setPopulationProgress((prev) => {
          // Slow down as we approach 95%
          const increment = prev < 70 ? 5 : prev < 90 ? 2 : 1;
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
      }, 200);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPopulatingBacklog]);

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

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modalContent} ref={modalRef}>
        {isPopulatingBacklog ? (
          <BacklogProgress progress={populationProgress} />
        ) : (
          <>
            <div className={styles.modalHeader}>
              <h2 id="modal-title">{title}</h2>
              <p className={styles.modalDescription}>
                Your project will have its own dedicated space and will be
                completely separate from other projects.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <InputWithClear
                id="projectName"
                value={projectName}
                onChange={handleProjectNameChange}
                onClear={handleClearProjectName}
                placeholder="Enter project name"
                label="Project name"
                error={errors.projectName}
                inputRef={inputRef}
                required={true}
              />

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

              <MemberSelection
                users={users}
                selectedMembers={selectedMembers}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
                isLoading={isLoadingUsers}
                error={errors.members}
                availableUsers={availableUsers}
              />

              <div className={styles.formGroup}>
                <div className={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    id="populateBacklog"
                    checked={shouldPopulateBacklog}
                    onChange={(e) => setShouldPopulateBacklog(e.target.checked)}
                  />
                  <label
                    htmlFor="populateBacklog"
                    className={styles.checkboxLabel}
                  >
                    Automatically populate backlog with AI
                    <span className={styles.aiLabel}>AI</span>
                  </label>
                </div>
                {shouldPopulateBacklog && (
                  <p className={styles.aiDescription}>
                    Our AI will analyze your project description and generate
                    relevant epics and user stories.
                  </p>
                )}
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onClose}
                  disabled={isCreatingProject || isPopulatingBacklog}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.startButton}
                  disabled={
                    !projectName.trim() ||
                    !description.trim() ||
                    isCreatingProject ||
                    isPopulatingBacklog
                  }
                >
                  {isCreatingProject ? "Creating Project..." : submitButtonText}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default NewProjectModal;
