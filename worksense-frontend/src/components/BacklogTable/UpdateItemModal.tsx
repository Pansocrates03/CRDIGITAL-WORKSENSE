import React, { FC, useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import ItemModalForm, { BacklogItemFormData } from "./ItemModalForm";
import { BacklogItemType } from "@/types/BacklogItemType";

interface UpdateItemModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onItemUpdated: () => void;
  onError?: (message: string) => void;
  item: BacklogItemType | null;
}

interface Epic {
  id: string;
  name: string;
}

const UpdateItemModal: FC<UpdateItemModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onItemUpdated,
  item,
  onError,
}) => {
  const [formData, setFormData] = useState<BacklogItemFormData>({
    name: "",
    type: "story",
    status: "new",
    priority: "medium",
    epicId: "",
    assigneeId: null,
    content: "",
    tags: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [users, setUsers] = useState<{ userId: number; name?: string }[]>([]);
  const [originalItem, setOriginalItem] = useState<BacklogItemType | null>(
    null
  );

  // Initialize form data when modal opens with an item
  useEffect(() => {
    if (isOpen && item) {
      // Create a copy of the item data for the form
      setFormData({
        ...item,
        // Ensure these properties are correctly set in the form data
        isSubItem: !!item.isSubItem,
        parentId: item.parentId || undefined,
      });

      // Store the original item for comparison
      setOriginalItem(item);
      fetchOptionsData();
    } else if (!isOpen) {
      setFormData({
        name: "",
        type: "story",
        status: "new",
        priority: "medium",
        epicId: "",
        assigneeId: null,
        content: "",
        tags: [],
        isSubItem: false,
        parentId: undefined,
      });
      setOriginalItem(null);
    }
  }, [isOpen, item]);

  const fetchOptionsData = async () => {
    try {
      const epicsRes = await apiClient.get(
        `/projects/${projectId}/backlog/items`
      );
      setEpics(
        Array.isArray(epicsRes.data)
          ? epicsRes.data
              .filter((i: BacklogItemType) => i.type === "epic")
              .map((epic: any) => ({
                id: epic.id,
                name: epic.name,
              }))
          : []
      );

      const usersRes = await apiClient.get(
        `/projects/${projectId}/members/members-detail`
      );
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

      console.log("Epics for edit:", epicsRes.data);
      console.log("Users for edit:", usersRes.data);
    } catch (err) {
      const msg = "Failed to load dropdown options";
      console.error(msg, err);
      setError(msg);
      onError?.(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsSubmitting(true);
    setError(null);

    // Create the payload with necessary type conversions
    const payload = {
      ...formData,
      epicId: formData.epicId || null,
      // Ensure parentId and isSubItem are properly set
      parentId: item.parentId || formData.parentId || null,
      isSubItem: item.isSubItem || formData.isSubItem || false,
    };

    console.log("Submitting update with payload:", payload);

    try {
      // Debug information to see what values we're working with
      console.log("Item data for debugging:", {
        id: item.id,
        parentId: item.parentId,
        isSubItem: item.isSubItem,
        formDataParentId: formData.parentId,
        formDataIsSubItem: formData.isSubItem,
      });

      // Check for parentId which is the most reliable indicator of a sub-item
      if (item.parentId || formData.parentId) {
        const parentId = item.parentId || formData.parentId;
        console.log(
          "Updating as sub-item:",
          item.id,
          "under parent:",
          parentId
        );
        await apiClient.put(
          `/projects/${projectId}/backlog/items/${parentId}/subitems/${item.id}`,
          payload
        );
      } else {
        console.log("Updating as regular item:", item.id, "type:", item.type);
        await apiClient.put(
          `/projects/${projectId}/backlog/items/${item.id}?type=${item.type}`,
          payload
        );
      }
      onItemUpdated();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update item";
      console.error("Error updating item:", err);
      setError(msg);
      onError?.(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (originalItem) {
      setFormData({ ...originalItem });
    }
  };

  if (!isOpen || !item) return null;

  return (
    <ItemModalForm
      mode="update"
      formData={formData}
      onChange={setFormData}
      onSubmit={handleSubmit}
      onClose={onClose}
      onClearOrReset={handleReset}
      loading={isSubmitting}
      error={error || undefined}
      users={users}
      epics={epics}
      disableTypeChange
    />
  );
};

export default UpdateItemModal;
