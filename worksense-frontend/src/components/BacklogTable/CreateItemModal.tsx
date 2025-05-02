// src/components/BacklogTable/CreateItemModal.tsx
import React, { FC, useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import ItemModalForm, { BacklogItemFormData } from "./ItemModalForm";
import { Epic, User } from "./types";

interface CreateItemModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onItemCreated: () => void;
  onError?: (message: string) => void;
}

const CreateItemModal: FC<CreateItemModalProps> = ({
  projectId,
  isOpen,
  onClose,
  onItemCreated,
  onError,
}) => {
  const initialState: BacklogItemFormData = {
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
  const [epics, setEpics] = useState<Epic[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialState);
      setIsSubmitting(false);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) fetchOptionsData();
  }, [isOpen, projectId]);

  const fetchOptionsData = async () => {
    try {
      // Asegúrate de que estas rutas coincidan con las de BacklogTablePage
      const epicsRes = await apiClient.get(
        `/projects/${projectId}/backlog/items`
      );
      setEpics(
        Array.isArray(epicsRes.data)
          ? epicsRes.data.filter((item: any) => item.type === "epic")
          : []
      );

      const usersRes = await apiClient.get(
        `/projects/${projectId}/members/members-detail`
      );
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

      // Agrega logs para debugging
      console.log("Epics fetched:", epicsRes.data);
      console.log("Users fetched:", usersRes.data);
    } catch (err) {
      const msg = "Failed to load dropdown options";
      console.error(msg, err);
      setError(msg);
      onError?.(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      ...formData,
      storyPoints: formData.storyPoints
        ? parseInt(formData.storyPoints as unknown as string)
        : null,
    };

    try {
      // Asegúrate de que esta ruta coincida con el formato de las otras
      await apiClient.post(`/projects/${projectId}/backlog/items`, payload);
      setFormData(initialState);
      onItemCreated();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create item";
      console.error("Error creating item:", err);
      setError(msg);
      onError?.(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({ ...initialState, type: formData.type });
  };

  if (!isOpen) return null;

  return (
    <ItemModalForm
      mode="create"
      formData={formData}
      onChange={setFormData}
      onSubmit={handleSubmit}
      onClose={onClose}
      onClearOrReset={handleClear}
      loading={isSubmitting}
      error={error || undefined}
      users={users}
      epics={epics}
    />
  );
};

export default CreateItemModal;
