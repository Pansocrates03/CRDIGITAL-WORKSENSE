// src/components/BacklogTable/ItemModalForm.tsx
import React, { useEffect } from "react";
import { X, Save, RefreshCw } from "lucide-react";
import SelectField from "./SelectField";
import styles from "./CreateItemModal.module.css";
import { BacklogItemType } from "@/types/BacklogItemType";

interface Epic {
  id: string;
  name: string;
}

interface User {
  userId: number;
  name?: string;
}

export interface BacklogItemFormData extends Partial<BacklogItemType> {
  content?: string;
  tags?: string[];
  epicId?: string;
  parentId?: string;
  isSubItem?: boolean;
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

  // Clear acceptance criteria when type changes to non-story
  useEffect(() => {
    if (formData.type !== "story" && formData.acceptanceCriteria?.length) {
      onChange({ ...formData, acceptanceCriteria: [] });
    }
  }, [formData.type]);

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
      { value: "new", label: "New" },
      { value: "toDo", label: "To Do" },
      { value: "inProgress", label: "In Progress" },
      { value: "inReview", label: "In Review" },
      { value: "done", label: "Done" },
    ],
    priority: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
    size: [
      { value: "XS", label: "XS" },
      { value: "S", label: "S" },
      { value: "M", label: "M" },
      { value: "L", label: "L" },
      { value: "XL", label: "XL" },
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
          <h2>
            {mode === "create" ? "Create New Item" : `Update ${formData.type}`}
          </h2>
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
            <label htmlFor="name">Name*</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name || ""}
              onChange={handleChange}
              required
              placeholder="Enter name"
              disabled={loading}
            />
          </div>

          <SelectField
            id="type"
            name="type"
            value={formData.type || ""}
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
            value={formData.status || "new"}
            onChange={handleChange}
            options={selectOptions.status}
            label="Status"
            styleClass="status"
            disabled={loading}
          />

          <SelectField
            id="priority"
            name="priority"
            value={formData.priority || "medium"}
            onChange={handleChange}
            options={selectOptions.priority}
            label="Priority"
            styleClass="priority"
            disabled={loading}
          />

          <SelectField
            id="size"
            name="size"
            value={formData.size || ""}
            onChange={handleChange}
            options={selectOptions.size}
            label="Size"
            styleClass="size"
            disabled={loading}
          />

          <SelectField
            id="assigneeId"
            name="assigneeId"
            value={formData.assigneeId?.toString() || ""}
            onChange={handleChange}
            options={selectOptions.assignee}
            label="Assignee"
            styleClass="assignee"
            disabled={loading}
          />

          {formData.type === "story" && (
            <SelectField
              id="epicId"
              name="epicId"
              value={formData.epicId || ""}
              onChange={handleChange}
              options={[
                { value: "", label: "Select Epic (Optional)" },
                ...epics.map((epic) => ({
                  value: epic.id,
                  label: epic.name,
                })),
              ]}
              label="Epic"
              styleClass="epic"
              disabled={loading}
            />
          )}

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={5}
              disabled={loading}
              placeholder="Enter description"
            />
          </div>

          {/* Only show acceptance criteria for stories */}
          {formData.type === "story" && (
            <div className={styles.formGroup}>
              <label htmlFor="acceptanceCriteria">
                Acceptance Criteria (one per line)
              </label>
              <textarea
                id="acceptanceCriteria"
                name="acceptanceCriteria"
                value={formData.acceptanceCriteria?.join("\n") || ""}
                onChange={(e) => {
                  const lines = e.target.value
                    .split("\n")
                    .filter((line) => line.trim());
                  onChange({ ...formData, acceptanceCriteria: lines });
                }}
                rows={5}
                disabled={loading}
                placeholder="Enter acceptance criteria"
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
              {loading ? (
                "Loading..."
              ) : (
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
