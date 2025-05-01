// src/components/BacklogTable/CreateItemModal.tsx
import React, { FC, useState } from "react";
import apiClient from "@/api/apiClient";
import { X, Save } from "lucide-react";
import SelectField from "./SelectField";
import styles from "./CreateItemModal.module.css";
import fieldStyles from "./SelectField.module.css";

interface CreateItemModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: () => void;
}

const CreateItemModal: FC<CreateItemModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onItemCreated,
}) => {
  const initialState = {
    title: "",
    type: "story",
    status: "",
    priority: "medium",
    epicId: "",
    storyPoints: null,
    severity: "major",
    assigneeId: "",
    content: "",
    tags: [],
  };

  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "storyPoints") {
      setFormData({
        ...formData,
        [name]: value ? parseInt(value) : null,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post(`/api/v1/${projectId}/backlog/items`, formData);
      setFormData(initialState);
      onItemCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create item");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Opciones para los selects
  const typeOptions = [
    { value: "epic", label: "Epic" },
    { value: "story", label: "Story" },
    { value: "bug", label: "Bug" },
    { value: "techTask", label: "Tech Task" },
    { value: "knowledge", label: "Knowledge" },
  ];

  const statusOptions = [
    { value: "", label: "Default Status" },
    { value: "todo", label: "Todo" },
    { value: "in-progress", label: "In Progress" },
    { value: "review", label: "Review" },
    { value: "done", label: "Done" },
    { value: "blocked", label: "Blocked" },
    { value: "new", label: "New" },
  ];

  const priorityOptions = [
    { value: "lowest", label: "Lowest" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "highest", label: "Highest" },
  ];

  const severityOptions = [
    { value: "minor", label: "Minor" },
    { value: "major", label: "Major" },
    { value: "critical", label: "Critical" },
    { value: "blocker", label: "Blocker" },
  ];

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Create New Backlog Item</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title*</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter title"
            />
          </div>

          <SelectField
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={typeOptions}
            label="Type"
            required
            styleClass="type"
          />

          <SelectField
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
            label="Status"
            placeholder="Select status"
            styleClass="status"
          />

          <SelectField
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions}
            label="Priority"
            styleClass="priority"
          />

          <div className={styles.formGroup}>
            <label htmlFor="assigneeId">Assignee ID</label>
            <input
              id="assigneeId"
              name="assigneeId"
              type="text"
              value={formData.assigneeId}
              onChange={handleChange}
              placeholder="Assignee ID"
            />
          </div>

          {/* Conditional fields based on type */}
          {formData.type === "story" && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="epicId">Epic ID</label>
                <input
                  id="epicId"
                  name="epicId"
                  type="text"
                  value={formData.epicId}
                  onChange={handleChange}
                  placeholder="Epic ID (optional)"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="storyPoints">Story Points</label>
                <input
                  id="storyPoints"
                  name="storyPoints"
                  type="number"
                  value={
                    formData.storyPoints === null ? "" : formData.storyPoints
                  }
                  onChange={handleChange}
                  placeholder="Story Points"
                />
              </div>
            </>
          )}

          {formData.type === "bug" && (
            <SelectField
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              options={severityOptions}
              label="Severity"
              styleClass="severity"
            />
          )}

          {formData.type === "knowledge" && (
            <div className={styles.formGroup}>
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Content"
                rows={5}
              />
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X size={16} className="mr-1" />
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Loading...</>
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  Create Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateItemModal;
