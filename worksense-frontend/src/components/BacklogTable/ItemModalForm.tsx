// src/components/BacklogTable/ItemModalForm.tsx
import React, { useEffect } from "react";
import { RefreshCw, Save, X } from "lucide-react";
import SelectField from "./SelectField";
import styles from "./CreateItemModal.module.css";
import BacklogItemType from "@/types/BacklogItemType";
import { Button } from "@/components/ui/button.tsx";

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
  sprints: any[];
  disableTypeChange?: boolean;
  storyPointScale?: "fibonacci" | "linear" | "tshirt";
  statusOptions?: string[];
}

const getSizeOptions = (scale: string = "tshirt") => {
  if (scale === "fibonacci") {
    return [
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "5", label: "5" },
      { value: "8", label: "8" },
      { value: "13", label: "13" },
      { value: "21", label: "21" },
    ];
  } else if (scale === "linear") {
    return [
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5" },
      { value: "6", label: "6" },
      { value: "7", label: "7" },
      { value: "8", label: "8" },
    ];
  } else {
    return [
      { value: "XS", label: "XS" },
      { value: "S", label: "S" },
      { value: "M", label: "M" },
      { value: "L", label: "L" },
      { value: "XL", label: "XL" },
    ];
  }
};

const getDefaultStatusOptions = () => [
  "New",
  "To Do",
  "In Progress",
  "In Review",
  "Done",
];

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
  sprints,
  disableTypeChange = false,
  storyPointScale,
  statusOptions: statusOptionsProp,
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

  const statusOptions =
    statusOptionsProp && statusOptionsProp.length > 0
      ? statusOptionsProp
      : getDefaultStatusOptions();

  const selectOptions = {
    type: [
      { value: "epic", label: "Epic" },
      { value: "story", label: "Story" },
      { value: "bug", label: "Bug" },
      { value: "techTask", label: "Tech Task" },
      { value: "knowledge", label: "Knowledge" },
    ],
    status: statusOptions.map((status) => ({ value: status, label: status })),
    priority: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
    ],
    size: getSizeOptions(storyPointScale),
    sprint: [
      { value: "", label: "Select Sprint (Optional)" },
      ...sprints.map((s) => ({ value: s.id, label: s.name })),
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
            {mode === "create"
              ? `Create New ${
                  formData.type?.charAt(0).toUpperCase() +
                    formData.type?.slice(1) || "Item"
                }`
              : `Update ${formData.type || "Item"}`}
          </h2>
          <Button
            variant={"outline"}
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
            disabled={loading}
          >
            <X size={18} />
          </Button>
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
            value={formData.status || statusOptions[0]}
            onChange={handleChange}
            options={selectOptions.status}
            label="Status"
            required
            styleClass="status"
            disabled={loading}
          >
            {statusOptions && statusOptions.length > 0 ? (
              statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))
            ) : (
              ["New", "In Progress", "Done"].map(option => (
                <option key={option} value={option}>{option}</option>
              ))
            )}
          </SelectField>

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

          {formData.type !== "epic" && (
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
          )}

          {formData.type !== "epic" && (
            <SelectField
              id="sprint"
              name="sprint"
              value={formData.sprint || ""}
              onChange={handleChange}
              options={selectOptions.sprint}
              label="Sprint"
              styleClass="sprint"
              disabled={loading}
            />
          )}

          {formData.type !== "epic" && (
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
          )}

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
            <Button
              variant={"secondary"}
              type="button"
              onClick={onClearOrReset}
              disabled={loading}
            >
              <RefreshCw size={16} className="mr-1" />
              {mode === "create" ? "Clear" : "Reset"}
            </Button>

            <Button
              variant={"default"}
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
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemModalForm;
