// src/components/BacklogTable/UpdateItemModal.tsx
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
    storyPoints: null,
    severity: "major",
    assigneeId: "",
    content: "",
    tags: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [epics, setEpics] = useState<BacklogItemType[]>([]);
  const [users, setUsers] = useState<{ userId: number; name?: string }[]>([]);
  const [originalItem, setOriginalItem] = useState<BacklogItemType | null>(
    null
  );

  useEffect(() => {
    if (isOpen && item) {
      setFormData({ ...item });
      setOriginalItem(item);
      fetchOptionsData();
    } else if (!isOpen) {
      setFormData({
        name: "",
        type: "story",
        status: "new",
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
          ? epicsRes.data.filter((i: BacklogItemType) => i.type === "epic")
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

    const payload = {
      ...formData,
      storyPoints:
        formData.storyPoints && typeof formData.storyPoints === "string"
          ? parseInt(formData.storyPoints)
          : formData.storyPoints,
    };

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
