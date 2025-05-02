// src/pages/BacklogTable/BacklogTablePage.tsx
import React, { FC, useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import styles from "./BacklogTablePage.module.css";
import BacklogHeader from "@/components/BacklogTable/BacklogHeader";
import BacklogAlerts from "@/components/BacklogTable/BacklogAlerts";
import BacklogTableSection from "@/components/BacklogTable/BacklogTableSection";
import SearchFilter from "@/components/BacklogTable/SearchFilter";
import BacklogRow from "@/components/BacklogTable/BacklogRow";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import CreateItemModal from "@/components/BacklogTable/CreateItemModal";
import UpdateItemModal from "@/components/BacklogTable/UpdateItemModal";
import { EpicRow } from "@/components/BacklogTable/EpicRow";

interface BacklogItem {
  id: string;
  projectId: string;
  type: "epic" | "story" | "bug" | "techTask" | "knowledge";
  title: string;
  status: string;
  assigneeId?: string | number | null;
  priority: string;
  storyPoints?: number | null;
  severity?: string | null;
  epicId?: string | null;
}

interface ProjectMember {
  userId: number;
  name?: string;
  nickname?: string;
  profilePicture?: string;
}

const BacklogTablePage: FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<BacklogItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEpics, setExpandedEpics] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estados para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BacklogItem | null>(null);
  const [deleteModalTitle, setDeleteModalTitle] = useState("");
  const [deleteModalMessage, setDeleteModalMessage] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["backlog", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const res = await apiClient.get(`/projects/${projectId}/backlog/items`);
      return res.data;
    },
    enabled: !!projectId,
  });

  const { data: members = [] } = useQuery<ProjectMember[]>({
    queryKey: ["projectMembers", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await apiClient.get(`/projects/${projectId}/members-detail`);
      return res.data;
    },
    enabled: !!projectId,
  });

  // Añadir log para depurar los datos de miembros
  useEffect(() => {
    console.log("Members data:", members);
  }, [members]);

  const memberMap = useMemo(() => {
    const map = new Map<number, ProjectMember>();
    members.forEach((m) => m.userId && map.set(m.userId, m));
    return map;
  }, [members]);

  const categorized = useMemo(() => {
    const all = Array.isArray(data) ? data : [];
    return {
      epics: all.filter((i) => i.type === "epic"),
      stories: all.filter((i) => i.type === "story"),
      standaloneStories: all.filter((i) => i.type === "story" && !i.epicId),
      bugs: all.filter((i) => i.type === "bug"),
      techTasks: all.filter((i) => i.type === "techTask"),
      knowledge: all.filter((i) => i.type === "knowledge"),
    };
  }, [data]);

  // Función para manejar la edición de un ítem
  const handleEdit = (item: BacklogItem) => {
    setItemToEdit(item);
    setIsEditModalOpen(true);
  };

  // Función para manejar la eliminación de un ítem
  const handleDelete = (item: BacklogItem) => {
    setItemToDelete(item);
    setDeleteModalTitle(
      `Delete ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`
    );
    setDeleteModalMessage(`Are you sure you want to delete "${item.title}"?`);
    setShowDeleteModal(true);
  };

  // Función para manejar la eliminación de un epic
  const handleDeleteEpic = (epicId: string) => {
    const epic = categorized.epics.find((e) => e.id === epicId);
    if (!epic) return;

    const epicStories = categorized.stories.filter((s) => s.epicId === epicId);
    const message =
      epicStories.length > 0
        ? `Are you sure you want to delete the epic "${epic.title}" and all its stories (${epicStories.length})?`
        : `Are you sure you want to delete the epic "${epic.title}"?`;

    setItemToDelete(epic);
    setDeleteModalTitle("Delete Epic");
    setDeleteModalMessage(message);
    setShowDeleteModal(true);
  };

  // Función para ejecutar la eliminación
  const executeDelete = async () => {
    if (!itemToDelete || !projectId) return;

    try {
      // Si es un epic, primero eliminamos sus historias
      if (itemToDelete.type === "epic") {
        const epicStories = categorized.stories.filter(
          (s) => s.epicId === itemToDelete.id
        );
        if (epicStories.length > 0) {
          // Eliminar todas las historias asociadas
          const deletePromises = epicStories.map((story) =>
            apiClient.delete(
              `/projects/${projectId}/backlog/items/${story.id}?type=story`
            )
          );
          await Promise.all(deletePromises);
        }
      }

      // Eliminar el ítem
      await apiClient.delete(
        `/projects/${projectId}/backlog/items/${itemToDelete.id}?type=${itemToDelete.type}`
      );

      handleSuccess(`${itemToDelete.title} successfully deleted`);
      refetch();
    } catch (error) {
      console.error("Error deleting item:", error);
      handleError("Failed to delete item");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleError = (msg: string) => {
    setErrorMessage(msg);
    setShowError(true);
    setTimeout(() => setShowError(false), 5000);
  };

  const matchesSearch = (item: BacklogItem) =>
    !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());

  const renderRows = (items: BacklogItem[], indent = false) =>
    items
      .filter(matchesSearch)
      .map((item) => (
        <BacklogRow
          key={item.id}
          item={item}
          indent={indent}
          memberMap={memberMap}
          onEdit={() => handleEdit(item)}
          onDelete={() => handleDelete(item)}
        />
      ));

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load backlog.</div>;

  return (
    <div>
      <BacklogAlerts
        successMessage={showSuccess ? successMessage : undefined}
        errorMessage={showError ? errorMessage : undefined}
      />

      <BacklogHeader onAddItem={() => setIsModalOpen(true)} />
      <div className="border-b border-border my-4"></div>
      <SearchFilter
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search backlog items..."
      />

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Points/Severity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <BacklogTableSection title="Epics">
              {categorized.epics.map((epic) => (
                <React.Fragment key={epic.id}>
                  <EpicRow
                    epic={{
                      ...epic,
                      stories: categorized.stories.filter(
                        (s) => s.epicId === epic.id
                      ),
                    }}
                    isExpanded={expandedEpics.includes(epic.id)}
                    onToggle={() =>
                      setExpandedEpics((prev) =>
                        prev.includes(epic.id)
                          ? prev.filter((id) => id !== epic.id)
                          : [...prev, epic.id]
                      )
                    }
                    colSpan={5}
                    onEdit={() => handleEdit(epic)}
                    onDelete={() => handleDeleteEpic(epic.id)}
                  />
                  {expandedEpics.includes(epic.id) &&
                    renderRows(
                      categorized.stories.filter((s) => s.epicId === epic.id),
                      true
                    )}
                </React.Fragment>
              ))}
            </BacklogTableSection>

            <BacklogTableSection title="User Stories">
              {renderRows(categorized.standaloneStories)}
            </BacklogTableSection>

            <BacklogTableSection title="Bugs">
              {renderRows(categorized.bugs)}
            </BacklogTableSection>

            <BacklogTableSection title="Tech Tasks">
              {renderRows(categorized.techTasks)}
            </BacklogTableSection>

            <BacklogTableSection title="Knowledge Items">
              {renderRows(categorized.knowledge)}
            </BacklogTableSection>
          </tbody>
        </table>
      </div>

      {projectId && (
        <CreateItemModal
          projectId={projectId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onItemCreated={() => {
            handleSuccess("Item created successfully!");
            refetch();
          }}
          onError={handleError}
        />
      )}

      {projectId && (
        <UpdateItemModal
          projectId={projectId}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onItemUpdated={() => {
            handleSuccess("Item updated successfully!");
            refetch();
          }}
          onError={handleError}
          item={itemToEdit}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={executeDelete}
        title={deleteModalTitle}
        message={deleteModalMessage}
      />
    </div>
  );
};

export default BacklogTablePage;
