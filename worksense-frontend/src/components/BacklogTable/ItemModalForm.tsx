// src/components/BacklogTable/ItemModalForm.tsx
import React from "react";
import { X, Save, RefreshCw } from "lucide-react";
import SelectField from "./SelectField";
import styles from "./CreateItemModal.module.css";

interface Epic {
  id: string;
  title: string;
}

interface User {
  userId: number;
  name?: string;
}

export interface BacklogItemFormData {
  id?: string;
  projectId?: string;
  type: "epic" | "story" | "bug" | "techTask" | "knowledge";
  title: string;
  status: string;
  assigneeId?: string;
  priority: "lowest" | "low" | "medium" | "high" | "highest";
  storyPoints?: number | null;
  severity?: string;
  epicId?: string;
  content?: string;
  tags?: string[];
}

interface ItemModalFormProps {
  mode: "create" | "update";
  formData: BacklogItemFormData;
  onChange: (data: BacklogItemFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onClearOrReset: () => void;
  loading: boolean;
  error?: string;
  users: User[];
  epics: Epic[];
  disableTypeChange?: boolean;
}

const ItemModalForm: React.FC<ItemModalFormProps> = ({
  mode,
  formData,
  onChange,
  onSubmit,
  onClose,
  onClearOrReset,
  loading,
  error,
  users,
  epics,
  disableTypeChange = false,
}) => {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
  };

  const storyPointsOptions = ["1", "2", "3", "5", "8", "13", "21"].map((v) => ({
    value: v,
    label: v,
  }));

  const selectOptions = {
    type: [
      { value: "epic", label: "Epic" },
      { value: "story", label: "Story" },
      { value: "bug", label: "Bug" },
      { value: "techTask", label: "Tech Task" },
      { value: "knowledge", label: "Knowledge" },
    ],
    status: [
      { value: "", label: "Unassigned" },
      { value: "todo", label: "To do" },
      { value: "in-progress", label: "In Progress" },
      { value: "review", label: "Review" },
      { value: "done", label: "Done" },
    ],
    priority: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
    severity: [
      { value: "minor", label: "Minor" },
      { value: "major", label: "Major" },
      { value: "critical", label: "Critical" },
      { value: "blocker", label: "Blocker" },
    ],
    epic: [
      { value: "", label: "Select Epic (Optional)" },
      ...epics
        .filter((e) => e.id !== formData.id) // avoid self-reference
        .map((e) => ({ value: e.id, label: e.title })),
    ],
    assignee: [
      { value: "", label: "Select Assignee (Optional)" },
      ...users.map((u) => ({
        value: u.userId.toString(),
        label: u.name || `User ${u.userId}`,
      })),
    ],
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{mode === "create" ? "Create New Item" : `Update ${formData.type}`}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={onSubmit}>
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
              disabled={loading}
            />
          </div>

          <SelectField
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={selectOptions.type}
            label="Type"
            required
            styleClass="type"
            disabled={disableTypeChange || loading}
          />

          <SelectField
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={selectOptions.status}
            label="Status"
            styleClass="status"
            disabled={loading}
          />

          <SelectField
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={selectOptions.priority}
            label="Priority"
            styleClass="priority"
            disabled={loading}
          />

          {formData.type !== "epic" && (
            <SelectField
              id="assigneeId"
              name="assigneeId"
              value={formData.assigneeId || ""}
              onChange={handleChange}
              options={selectOptions.assignee}
              label="Assignee"
              styleClass="assignee"
              disabled={loading}
            />
          )}

          {formData.type === "story" && (
            <>
              <SelectField
                id="epicId"
                name="epicId"
                value={formData.epicId || ""}
                onChange={handleChange}
                options={selectOptions.epic}
                label="Epic"
                styleClass="epic"
                disabled={loading}
              />

              <SelectField
                id="storyPoints"
                name="storyPoints"
                value={formData.storyPoints?.toString() || ""}
                onChange={handleChange}
                options={storyPointsOptions.map((p) => ({ value: p.value, label: p.label }))}
                label="Story Points"
                styleClass="storyPoints"
                disabled={loading}
              />
            </>
          )}

          {formData.type === "bug" && (
            <SelectField
              id="severity"
              name="severity"
              value={formData.severity || ""}
              onChange={handleChange}
              options={selectOptions.severity}
              label="Severity"
              styleClass="severity"
              disabled={loading}
            />
          )}

          {formData.type === "knowledge" && (
            <div className={styles.formGroup}>
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                name="content"
                value={formData.content || ""}
                onChange={handleChange}
                rows={5}
                disabled={loading}
              />
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              <X size={16} className="mr-1" /> Cancel
            </button>

            <button
              type="button"
              className={`${styles.cancelButton} ml-auto mr-2`}
              onClick={onClearOrReset}
              disabled={loading}
            >
              <RefreshCw size={16} className="mr-1" />
              {mode === "create" ? "Clear" : "Reset"}
            </button>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Loading..." : (
                <>
                  <Save size={16} className="mr-1" />
                  {mode === "create" ? "Create Item" : "Update"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemModalForm;
