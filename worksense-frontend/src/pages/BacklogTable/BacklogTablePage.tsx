// src/pages/BacklogTable/BacklogTablePage.tsx
import React, { FC, useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import ItemDetailsModal from "@/components/BacklogTable/ItemDetailsModal";
import { EpicRow } from "@/components/BacklogTable/EpicRow";
import { useMembers } from "@/hooks/useMembers";

import { BacklogItemType } from "@/types/BacklogItemType";
import MemberDetailed from "@/types/MemberDetailedType";

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
  const [itemToEdit, setItemToEdit] = useState<BacklogItemType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEpics, setExpandedEpics] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estados para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BacklogItemType | null>(
    null
  );
  const [deleteModalName, setDeleteModalName] = useState("");
  const [deleteModalMessage, setDeleteModalMessage] = useState("");

  // Estados para el modal de generación de historias con IA
  const [showGenerateStoriesModal, setShowGenerateStoriesModal] =
    useState(false);
  const [selectedEpicId, setSelectedEpicId] = useState("");
  const [selectedEpicName, setSelectedEpicName] = useState("");

  // Estado para el modal de detalles
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["backlog", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const res = await apiClient.get(`/projects/${projectId}/backlog/items`);
      return res.data;
    },
    enabled: !!projectId,
  });

  const { data: members = [] } = useMembers(projectId || "");

  const memberMap = useMemo(() => {
    const map = new Map<number, MemberDetailed>();
    members.forEach((m) => m.userId && map.set(m.userId, m));
    return map;
  }, [members]);

  const getMemberInfo = (userId: number | string | null) => {
    if (!userId) return null;
    const numericId = typeof userId === "string" ? parseInt(userId) : userId;
    return memberMap.get(numericId);
  };

  const categorized = useMemo(() => {
    const all = Array.isArray(data) ? data : [];

    // Create categories of items
    return {
      epics: all.filter((i) => i.type === "epic" && i.name),
      stories: all.filter((i) => i.type === "story" && i.name),
      standaloneStories: all.filter(
        (i) =>
          i.type === "story" &&
          i.name &&
          (!i.subItems || i.subItems.length === 0)
      ),
      bugs: all.filter((i) => i.type === "bug" && i.name),
      techTasks: all.filter((i) => i.type === "techTask" && i.name),
      knowledge: all.filter((i) => i.type === "knowledge" && i.name),
    };
  }, [data]);

  // Update getEpicStories to use subItems directly
  const getEpicStories = (epicId: string): BacklogItemType[] => {
    if (!data) return [];
    const epic = data.find((item: BacklogItemType) => item.id === epicId);
    return epic?.subItems || [];
  };

  // Función para manejar la edición de un ítem
  const handleEdit = (item: BacklogItemType) => {
    if (!item.name || !item.type) return;
    setItemToEdit(item);
    setIsEditModalOpen(true);
    // Si el modal de detalles está abierto, lo cerramos
    if (showDetailsModal) {
      setShowDetailsModal(false);
    }
  };

  // Función para manejar la eliminación de un ítem
  const handleDelete = (item: BacklogItemType) => {
    if (!item.name || !item.type) return;

    // Check if this is a subitem by looking at its parent epic
    const isSubItem = categorized.epics.some((epic) =>
      epic.subItems?.some((subItem: BacklogItemType) => subItem.id === item.id)
    );

    // If it's a subitem, find its parent epic
    const parentEpic = isSubItem
      ? categorized.epics.find((epic) =>
          epic.subItems?.some(
            (subItem: BacklogItemType) => subItem.id === item.id
          )
        )
      : null;

    setItemToDelete({
      ...item,
      isSubItem,
      parentId: parentEpic?.id,
    });

    setDeleteModalName(
      `Delete ${item.type === "epic" ? "Epic" : "Story"} "${item.name}"`
    );
    setDeleteModalMessage(`Are you sure you want to delete "${item.name}"?`);
    setShowDeleteModal(true);
  };

  // Update handleDeleteEpic to handle subItems
  const handleDeleteEpic = (epicId: string) => {
    const epic = categorized.epics.find((e) => e.id === epicId);
    if (!epic || !epic.name) return;

    const epicStories = getEpicStories(epicId);
    const message =
      epicStories.length > 0
        ? `Are you sure you want to delete the epic "${epic.name}" and all its stories (${epicStories.length})?`
        : `Are you sure you want to delete the epic "${epic.name}"?`;

    setItemToDelete(epic);
    setDeleteModalName("Delete Epic");
    setDeleteModalMessage(message);
    setShowDeleteModal(true);
  };

  // Función para abrir el modal de generación de historias con IA
  const handleGenerateStories = (epicId: string, epicName: string) => {
    if (!projectId) return;

    setSelectedEpicId(epicId);
    setSelectedEpicName(epicName);
    setShowGenerateStoriesModal(true);
  };

  // Función para ver los detalles de un ítem
  const handleViewDetails = (item: BacklogItem) => {
    console.log("BacklogTablePage: handleViewDetails llamado con item:", item);
    setSelectedItem(item);
    setShowDetailsModal(true);
    console.log("BacklogTablePage: showDetailsModal establecido a true");
  };

  // Función para ejecutar la eliminación
  // Update executeDelete to handle subItems
  const executeDelete = async () => {
    if (!itemToDelete || !projectId) return;

    try {
      // If it's an epic, first delete its subitems
      if (itemToDelete.type === "epic") {
        const epicStories = getEpicStories(itemToDelete.id);
        if (epicStories.length > 0) {
          // Delete all subitems associated
          const deletePromises = epicStories.map((story) =>
            apiClient.delete(
              `/projects/${projectId}/backlog/items/${itemToDelete.id}/subitems/${story.id}`
            )
          );
          await Promise.all(deletePromises);
        }
      }

      // Delete the item - only use type parameter for regular items, not subitems
      if (itemToDelete.isSubItem && itemToDelete.parentId) {
        await apiClient.delete(
          `/projects/${projectId}/backlog/items/${itemToDelete.parentId}/subitems/${itemToDelete.id}`
        );
      } else {
        await apiClient.delete(
          `/projects/${projectId}/backlog/items/${itemToDelete.id}?type=${itemToDelete.type}`
        );
      }

      // Si el ítem que se está eliminando es el que se está mostrando en el modal de detalles, cerramos el modal
      if (selectedItem && selectedItem.id === itemToDelete.id) {
        setShowDetailsModal(false);
      }

      handleSuccess(`${itemToDelete.name} successfully deleted`);
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

  const matchesSearch = (item: BacklogItemType) =>
    !searchTerm ||
    (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderRows = (items: BacklogItemType[], indent = false) =>
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
          onViewDetails={() => handleViewDetails(item)}
        />
      ));

  // Function to handle when stories are added to an epic
  const handleStoriesAdded = (epicId: string) => {
    // Expand the epic if it's not already expanded
    if (!expandedEpics.includes(epicId)) {
      setExpandedEpics((prev) => [...prev, epicId]);
    }

    // Show success message
    handleSuccess("Stories added successfully!");

    // Reload the backlog data
    refetch();
  };

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
              <th>Name</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Size</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <BacklogTableSection title="Epics">
              {categorized.epics.map((epic) => {
                const epicStories = getEpicStories(epic.id);
                return (
                  <React.Fragment key={epic.id}>
                    <EpicRow
                      epic={{
                        ...epic,
                        stories: epicStories,
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
                      memberMap={memberMap}
                    />
                    {expandedEpics.includes(epic.id) &&
                      renderRows(epicStories, true)}
                  </React.Fragment>
                );
              })}
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
          epicName={selectedEpicName}
          isOpen={showGenerateStoriesModal}
          onClose={() => setShowGenerateStoriesModal(false)}
          onStoriesAdded={() => handleStoriesAdded(selectedEpicId)}
          onError={handleError}
        />
      )}

      {projectId && (
        <ItemDetailsModal
          projectId={projectId}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onEditClick={() => {
            setItemToEdit(selectedItem);
            setIsEditModalOpen(true);
            setShowDetailsModal(false);
          }}
          item={selectedItem}
          memberMap={memberMap}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={executeDelete}
        title={deleteModalName}
        message={deleteModalMessage}
      />
    </div>
  );
};

export default BacklogTablePage;
