import React, { FC, useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import ItemModalForm, { BacklogItemFormData } from "./ItemModalForm";
import BacklogItemType from "@/types/BacklogItemType";
import { useBacklogItemUpdate } from "@/hooks/useBacklogItemUpdate";

interface UpdateItemModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onItemUpdated: (response?: any) => void;
  onError?: (message: string) => void;
  item: BacklogItemType | null;
  storyPointScale?: "fibonacci" | "linear" | "tshirt";
  statusOptions?: string[];
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
  storyPointScale,
  statusOptions,
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
  const [sprints, setSprints] = useState<{ id: string; name: string }[]>([]);
  const updateMutation = useBacklogItemUpdate();

  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        ...item,
        isSubItem: !!item.isSubItem,
        parentId: item.parentId || undefined,
      });
      setOriginalItem(item);
      fetchOptionsData();
      fetchSprints();
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
      setSprints([]);
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
    } catch (err) {
      const msg = "Failed to load dropdown options";
      setError(msg);
      onError?.(msg);
    }
  };

  const fetchSprints = async () => {
    try {
      const res = await apiClient.get(`/projects/${projectId}/sprints`);
      setSprints(
        Array.isArray(res.data)
          ? res.data.map((s: any) => ({ id: s.id, name: s.name }))
          : []
      );
    } catch (err) {
      setSprints([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsSubmitting(true);
    setError(null);

    // Payload: status se guarda como texto normal
    const payload = {
      ...formData,
      epicId: formData.epicId || null,
      parentId: item.parentId || formData.parentId || null,
      isSubItem: item.isSubItem || formData.isSubItem || false,
    };

    // Helper para actualizar sprint después del update principal
    const updateSprintIfNeeded = async () => {
      if (formData.sprint !== item.sprint) {
        if (item.parentId || formData.parentId) {
          const parentId = item.parentId || formData.parentId;
          await apiClient.put(
            `/projects/${projectId}/backlog/items/${parentId}/subitems/${item.id}/sprints/${formData.sprint}`
          );
        } else {
          await apiClient.put(
            `/projects/${projectId}/backlog/items/${item.id}/sprints/${formData.sprint}`
          );
        }
      }
    };

    updateMutation.mutate(
      {
        projectId,
        itemId: item.id,
        itemType: item.type || "",
        updateData: payload,
        parentId: item.parentId || formData.parentId || undefined,
      },
      {
        onSuccess: async (response) => {
          console.log("Update mutation success response:", response);
          await updateSprintIfNeeded();
          onItemUpdated(response);
          onClose();
        },
        onError: (err: any) => {
          console.error("Update mutation error:", err);
          const msg = err.response?.data?.message || "Failed to update item";
          setError(msg);
          onError?.(msg);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
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
      sprints={sprints}
      storyPointScale={storyPointScale}
      statusOptions={statusOptions}
    />
  );
};

export default UpdateItemModal;
