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
import GenerateStoriesModal from "@/components/BacklogTable/GenerateStoriesModal";
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
  linkedItems?: string[] | null;
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

  // Estados para el modal de generación de historias con IA
  const [showGenerateStoriesModal, setShowGenerateStoriesModal] = useState(false);
  const [selectedEpicId, setSelectedEpicId] = useState("");
  const [selectedEpicTitle, setSelectedEpicTitle] = useState("");

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
    
    // Hacer log de los datos para depuración
    console.log("Datos del backlog:", all);
    
    // Crear categorías de ítems
    return {
      epics: all.filter((i) => i.type === "epic"),
      stories: all.filter((i) => i.type === "story"),
      // Las historias pueden estar vinculadas a épicas de dos maneras:
      // 1. A través del campo epicId
      // 2. A través del campo linkedItems (array que contiene el id de la épica)
      standaloneStories: all.filter((i) => 
        i.type === "story" && 
        !i.epicId && 
        (!i.linkedItems || i.linkedItems.length === 0)
      ),
      bugs: all.filter((i) => i.type === "bug"),
      techTasks: all.filter((i) => i.type === "techTask"),
      knowledge: all.filter((i) => i.type === "knowledge"),
    };
  }, [data]);

  // Función para obtener las historias asociadas a una épica
  const getEpicStories = (epicId: string) => {
    if (!data) return [];
    
    // Encontrar historias que están asociadas a la épica
    return (Array.isArray(data) ? data : []).filter((item) => 
      item.type === "story" && (
        // A través del campo epicId
        item.epicId === epicId || 
        // O a través del campo linkedItems
        (item.linkedItems && item.linkedItems.includes(epicId))
      )
    );
  };

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

    const epicStories = getEpicStories(epicId);
    const message =
      epicStories.length > 0
        ? `Are you sure you want to delete the epic "${epic.title}" and all its stories (${epicStories.length})?`
        : `Are you sure you want to delete the epic "${epic.title}"?`;

    setItemToDelete(epic);
    setDeleteModalTitle("Delete Epic");
    setDeleteModalMessage(message);
    setShowDeleteModal(true);
  };

  // Función para abrir el modal de generación de historias con IA
  const handleGenerateStories = (epicId: string, epicTitle: string) => {
    if (!projectId) return;
    
    setSelectedEpicId(epicId);
    setSelectedEpicTitle(epicTitle);
    setShowGenerateStoriesModal(true);
  };

  // Función para manejar cuando se añaden historias a una épica
  const handleStoriesAdded = (epicId: string) => {
    // Expandir la épica si no está ya expandida
    if (!expandedEpics.includes(epicId)) {
      setExpandedEpics(prev => [...prev, epicId]);
    }
    
    // Mostrar mensaje de éxito
    handleSuccess("Stories added successfully!");
    
    // Recargar los datos del backlog
    refetch();
  };

  // Función para ejecutar la eliminación
  const executeDelete = async () => {
    if (!itemToDelete || !projectId) return;

    try {
      // Si es un epic, primero eliminamos sus historias
      if (itemToDelete.type === "epic") {
        const epicStories = getEpicStories(itemToDelete.id);
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
                      stories: getEpicStories(epic.id),
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
                    onGenerateStories={handleGenerateStories}
                  />
                  {expandedEpics.includes(epic.id) &&
                    renderRows(
                      getEpicStories(epic.id),
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

      {projectId && (
        <GenerateStoriesModal
          projectId={projectId}
          epicId={selectedEpicId}
          epicTitle={selectedEpicTitle}
          isOpen={showGenerateStoriesModal}
          onClose={() => setShowGenerateStoriesModal(false)}
          onStoriesAdded={() => handleStoriesAdded(selectedEpicId)}
          onError={handleError}
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
