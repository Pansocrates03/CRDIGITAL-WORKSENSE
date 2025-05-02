// src/components/BacklogTable/UpdateItemModal.tsx
import React, { FC, useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import ItemModalForm, { BacklogItemFormData } from "./ItemModalForm";
import { Epic, User } from "./types";

interface BacklogItem extends BacklogItemFormData {
  id: string;
}

interface UpdateItemModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onItemUpdated: () => void;
  onError?: (message: string) => void;
  item: BacklogItem | null;
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [originalItem, setOriginalItem] = useState<BacklogItem | null>(null);

  // Initialize form data when modal opens with an item
  useEffect(() => {
    if (isOpen && item) {
      console.log("Initial item data:", item);
      console.log("Item content:", item.content);
      console.log("Item description:", item.description);

      // Check if the item has a description but no content
      const itemWithContentFromDescription = { ...item };

      // If there's a description but no content, map the description to content
      if (
        !itemWithContentFromDescription.content &&
        itemWithContentFromDescription.description
      ) {
        console.log("Mapping description to content");
        itemWithContentFromDescription.content =
          itemWithContentFromDescription.description;
      }

      // If there's content but no description, map the content to description
      if (
        !itemWithContentFromDescription.description &&
        itemWithContentFromDescription.content
      ) {
        console.log("Mapping content to description");
        itemWithContentFromDescription.description =
          itemWithContentFromDescription.content;
      }

      console.log("Setting form data with:", itemWithContentFromDescription);

      setFormData(itemWithContentFromDescription);
      setOriginalItem(itemWithContentFromDescription);
      fetchOptionsData();
    } else if (!isOpen) {
      setFormData({
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
          ? epicsRes.data.filter((i: any) => i.type === "epic")
          : []
      );

      const usersRes = await apiClient.get(
        `/projects/${projectId}/members/members-detail`
      );
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

      // Agrega logs para debugging
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
      storyPoints:
        formData.storyPoints && typeof formData.storyPoints === "string"
          ? parseInt(formData.storyPoints)
          : formData.storyPoints,
      // Ensure both content and description fields are synchronized
      content: formData.content || formData.description,
      description: formData.description || formData.content,
    };

    console.log("Submitting update with payload:", payload);

    try {
      // Asegúrate de que esta ruta coincida con el formato de las otras
      await apiClient.put(
        `/projects/${projectId}/backlog/items/${item.id}?type=${formData.type}`,
        payload
      );
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
