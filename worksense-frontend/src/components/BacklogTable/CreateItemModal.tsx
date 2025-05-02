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
    name: "",
    type: "story",
    status: "new",
    priority: "medium",
    assigneeId: null,
    description: null,
    acceptanceCriteria: null,
    coverImage: null,
    size: null,
    sprint: null,
    epicId: "",
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
      const epicsRes = await apiClient.get(
        `/projects/${projectId}/backlog/items`
      );
      setEpics(
        Array.isArray(epicsRes.data)
          ? epicsRes.data
              .filter((item: any) => item.type === "epic")
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

    try {
      // Base payload without parentId and isSubItem
      const basePayload = {
        ...formData,
        projectId,
      };

      // If it's a story and an epic is selected, create it as a subitem
      if (formData.type === "story" && formData.epicId) {
        console.log("Creating subitem under epic:", formData.epicId);
        const subitemPayload = {
          ...basePayload,
          parentId: formData.epicId,
          isSubItem: true,
          type: "story", // Ensure type is set correctly
        };
        console.log("Subitem payload:", subitemPayload);
        await apiClient.post(
          `/projects/${projectId}/backlog/items/${formData.epicId}/subitems`,
          subitemPayload
        );
      } else {
        // For regular items, ensure parentId and isSubItem are not set
        const regularPayload = {
          ...basePayload,
          parentId: null,
          isSubItem: false,
        };
        console.log("Regular item payload:", regularPayload);
        await apiClient.post(
          `/projects/${projectId}/backlog/items`,
          regularPayload
        );
      }

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
