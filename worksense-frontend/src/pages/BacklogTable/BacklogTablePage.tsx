// src/pages/BacklogTable/BacklogTablePage.tsx
import React, { FC, useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { EpicRow } from "@/components/BacklogTable/EpicRow";
import { SectionHeader } from "@/components/BacklogTable/SectionHeader";
import CreateItemModal from "@/components/BacklogTable/CreateItemModal";
import SearchFilter from "@/components/BacklogTable/SearchFilter";
import StatusBadge from "@/components/BacklogTable/StatusBadge";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { FaTrashAlt, FaPencilAlt } from "react-icons/fa";
import styles from "./BacklogTablePage.module.css";

interface BacklogItem {
  id: string;
  projectId: string;
  type: "epic" | "story" | "bug" | "techTask" | "knowledge";
  title: string;
  status: string;
  assigneeId?: string | number | null;
  priority: "lowest" | "low" | "medium" | "high" | "highest";
  storyPoints?: number | null;
  severity?: string | null;
  epicId?: string | null;
}

const BacklogTablePage: FC = () => {
  const { id: projectId } = useParams<{ id: string }>();

  // Estados
  const [expandedEpics, setExpandedEpics] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Query para obtener datos
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["backlog", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await apiClient.get(`/projects/${projectId}/backlog/items`);
      return res.data;
    },
    enabled: !!projectId,
  });

  // Procesamos los datos con useMemo para evitar recálculos innecesarios
  const {
    items,
    epics,
    stories,
    standaloneStories,
    bugs,
    techTasks,
    knowledge,
  } = useMemo(() => {
    const itemArray: BacklogItem[] = Array.isArray(data) ? data : [];

    return {
      items: itemArray,
      epics: itemArray.filter((i) => i.type === "epic"),
      stories: itemArray.filter((i) => i.type === "story"),
      standaloneStories: itemArray.filter(
        (i) => i.type === "story" && !i.epicId
      ),
      bugs: itemArray.filter((i) => i.type === "bug"),
      techTasks: itemArray.filter((i) => i.type === "techTask"),
      knowledge: itemArray.filter((i) => i.type === "knowledge"),
    };
  }, [data]);

  // Función para expandir/contraer épicas
  const toggleEpic = (epicId: string) => {
    setExpandedEpics((prev) =>
      prev.includes(epicId)
        ? prev.filter((id) => id !== epicId)
        : [...prev, epicId]
    );
  };

  // Función para manejar la eliminación de una épica y todas sus historias
  const handleDeleteEpic = async (epicId: string) => {
    const epic = epics.find((e) => e.id === epicId);
    if (!epic) return;

    const epicStories = stories.filter((s) => s.epicId === epicId);
    const message =
      epicStories.length > 0
        ? `¿Estás seguro de que deseas eliminar la épica "${epic.title}" y todas sus historias (${epicStories.length})?`
        : `¿Estás seguro de que deseas eliminar la épica "${epic.title}"?`;

    if (window.confirm(message)) {
      try {
        // Primero eliminamos todas las historias asociadas
        if (epicStories.length > 0) {
          const deleteStoryPromises = epicStories.map((story) =>
            apiClient.delete(
              `/projects/${projectId}/backlog/items/${story.id}?type=story`
            )
          );
          await Promise.all(deleteStoryPromises);
        }

        // Después eliminamos la épica
        await apiClient.delete(
          `/projects/${projectId}/backlog/items/${epicId}?type=epic`
        );

        // Refrescamos los datos
        refetch();
      } catch (error) {
        console.error("Error al eliminar la épica:", error);
        alert(
          "Ocurrió un error al eliminar la épica. Por favor, inténtalo de nuevo."
        );
      }
    }
  };

  // Función para manejar la edición de una épica
  const handleEditEpic = (epicId: string) => {
    // Aquí iría la lógica para editar una épica
    console.log(`Editar épica: ${epicId}`);
    // Por ejemplo, podrías abrir un modal de edición
    // setEditingEpicId(epicId);
    // setIsEditModalOpen(true);
  };

  // Actualiza las épicas expandidas cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm || !epics) return;

    const epicsToExpand = epics
      .filter((epic) => {
        // Si el título de la épica coincide
        if (epic.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true;
        }

        // Si alguna historia dentro de la épica coincide
        const epicStories = stories.filter((s) => s.epicId === epic.id);
        return epicStories.some((story) =>
          story.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .map((epic) => epic.id);

    if (epicsToExpand.length > 0) {
      setExpandedEpics((prev) => {
        const newSet = new Set([...prev, ...epicsToExpand]);
        return [...newSet];
      });
    } else if (searchTerm === "") {
      // Si se limpia la búsqueda, cerramos todas las épicas
      setExpandedEpics([]);
    }
  }, [searchTerm, epics, stories]);

  // Función para verificar si un elemento coincide con la búsqueda
  const matchesSearch = (item: BacklogItem) => {
    if (!searchTerm) return true;
    return item.title.toLowerCase().includes(searchTerm.toLowerCase());
  };

  // Función para verificar si una historia debe mostrarse dentro de una épica
  const shouldShowStoryInEpic = (story: BacklogItem, epic: BacklogItem) => {
    if (!searchTerm) return true;

    // Si la historia coincide directamente
    if (story.title.toLowerCase().includes(searchTerm.toLowerCase()))
      return true;

    // Si la épica coincide, mostrar todas sus historias
    if (epic.title.toLowerCase().includes(searchTerm.toLowerCase()))
      return true;

    return false;
  };

  // Función para verificar si una épica debe mostrarse
  const shouldShowEpic = (epic: BacklogItem, epicStories: BacklogItem[]) => {
    if (!searchTerm) return true;

    // Si la épica coincide directamente
    if (epic.title.toLowerCase().includes(searchTerm.toLowerCase()))
      return true;

    // Si alguna historia dentro de la épica coincide
    return epicStories.some((story) =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Función para manejar la eliminación de un elemento
  const handleDelete = async (item: BacklogItem) => {
    if (
      window.confirm(`¿Estás seguro de que deseas eliminar "${item.title}"?`)
    ) {
      try {
        await apiClient.delete(
          `/projects/${projectId}/backlog/items/${item.id}?type=${item.type}`
        );
        // Refrescar los datos después de eliminar
        refetch();
      } catch (error) {
        console.error("Error al eliminar el elemento:", error);
        alert(
          "No se pudo eliminar el elemento. Por favor, inténtalo de nuevo."
        );
      }
    }
  };

  // Función para manejar la edición de un elemento
  const handleEdit = (item: BacklogItem) => {
    // Aquí iría la lógica para editar un elemento
    console.log("Editar elemento:", item);
    // Podrías abrir un modal de edición
    // setEditingItem(item);
    // setIsEditModalOpen(true);
  };

  // Función para renderizar una fila
  const renderRow = (item: BacklogItem, indent = false) => {
    let extraInfo = "-";
    if (item.type === "story") {
      extraInfo =
        item.storyPoints !== undefined && item.storyPoints !== null
          ? item.storyPoints.toString()
          : "-";
    } else if (item.type === "bug") {
      extraInfo = item.severity || "-";
    }

    return (
      <tr key={item.id} className={indent ? styles.nestedRow : ""}>
        <td style={{ paddingLeft: indent ? "2.5rem" : undefined }}>
          <div className="flex items-center gap-2">
            <StatusBadge type="type" value={item.type} />
            <span>{item.title}</span>
          </div>
        </td>
        <td>
          {item.status ? (
            <StatusBadge type="status" value={item.status} />
          ) : (
            "-"
          )}
        </td>
        <td>{item.assigneeId ?? "-"}</td>
        <td>
          {item.type === "bug" && item.severity ? (
            <StatusBadge type="severity" value={item.severity} />
          ) : item.type === "story" && item.storyPoints ? (
            item.storyPoints.toString()
          ) : (
            "-"
          )}
        </td>
        <td className={styles.actionButtons}>
          <button
            onClick={() => handleEdit(item)}
            className={styles.button}
            title="Editar"
          >
            <FaPencilAlt />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className={`${styles.button} ${styles.trashButton}`}
            title="Eliminar"
          >
            <FaTrashAlt />
          </button>
        </td>
      </tr>
    );
  };

  // Handler cuando se crea un nuevo elemento
  const handleItemCreated = () => {
    refetch();
  };

  // Renderizado para casos de carga o error
  if (isLoading) return <LoadingSpinner text="Loading backlog..." />;
  if (error) return <div className={styles.error}>Failed to load backlog.</div>;

  return (
    <div>
      <div className="flex items-baseline justify-between w-full">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Product Backlog
          </h2>
          <p className="text-muted-foreground mt-1">
            Track and manage epics, stories, bugs, tech tasks, and knowledge.
          </p>
        </div>
        <Button
          variant="default"
          size="default"
          className="bg-[#ac1754] hover:bg-[#8e0e3d] flex-shrink-0"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusIcon className="mr-1 h-4 w-4" />
          Add Item
        </Button>
      </div>
      <div className="border-b border-border my-4"></div>

      {/* Filtro de búsqueda con el nuevo componente */}
      <SearchFilter
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search backlog items..."
      />

      {/* Tabla de elementos */}
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
            {/* Épicas */}
            <tr>
              <td colSpan={5} className={styles.sectionHeader}>
                Epics
              </td>
            </tr>
            {epics.length === 0 ? (
              <tr>
                <td colSpan={5}>No epics found</td>
              </tr>
            ) : (
              epics
                .map((epic) => {
                  const epicStories = stories.filter(
                    (s) => s.epicId === epic.id
                  );

                  // Determinar si la épica debe mostrarse
                  if (!shouldShowEpic(epic, epicStories)) return null;

                  return (
                    <React.Fragment key={epic.id}>
                      <EpicRow
                        epic={{ ...epic, stories: epicStories }}
                        isExpanded={expandedEpics.includes(epic.id)}
                        onToggle={toggleEpic}
                        colSpan={5}
                        onEdit={() => handleEditEpic(epic.id)}
                        onDelete={() => handleDeleteEpic(epic.id)}
                      />
                      {expandedEpics.includes(epic.id) &&
                        epicStories
                          .filter((story) => shouldShowStoryInEpic(story, epic))
                          .map((story) => renderRow(story, true))}
                    </React.Fragment>
                  );
                })
                .filter(Boolean) // Elimina los null
            )}

            {/* Historias de usuario independientes */}
            <tr>
              <td colSpan={5} className={styles.sectionHeader}>
                User Stories
              </td>
            </tr>
            {standaloneStories.filter(matchesSearch).length === 0 ? (
              <tr>
                <td colSpan={5}>No standalone stories found</td>
              </tr>
            ) : (
              standaloneStories
                .filter(matchesSearch)
                .map((story) => renderRow(story))
            )}

            {/* Bugs */}
            <tr>
              <td colSpan={5} className={styles.sectionHeader}>
                Bugs
              </td>
            </tr>
            {bugs.filter(matchesSearch).length === 0 ? (
              <tr>
                <td colSpan={5}>No bugs found</td>
              </tr>
            ) : (
              bugs.filter(matchesSearch).map((bug) => renderRow(bug))
            )}

            {/* Tareas técnicas */}
            <tr>
              <td colSpan={5} className={styles.sectionHeader}>
                Tech Tasks
              </td>
            </tr>
            {techTasks.filter(matchesSearch).length === 0 ? (
              <tr>
                <td colSpan={5}>No tech tasks found</td>
              </tr>
            ) : (
              techTasks.filter(matchesSearch).map((task) => renderRow(task))
            )}

            {/* Elementos de conocimiento */}
            <tr>
              <td colSpan={5} className={styles.sectionHeader}>
                Knowledge Items
              </td>
            </tr>
            {knowledge.filter(matchesSearch).length === 0 ? (
              <tr>
                <td colSpan={5}>No knowledge items found</td>
              </tr>
            ) : (
              knowledge.filter(matchesSearch).map((item) => renderRow(item))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para crear nuevo elemento */}
      {projectId && (
        <CreateItemModal
          projectId={projectId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onItemCreated={handleItemCreated}
        />
      )}
    </div>
  );
};

export default BacklogTablePage;
