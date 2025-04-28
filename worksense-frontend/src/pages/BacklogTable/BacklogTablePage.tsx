import { FC, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./BacklogTablePage.module.css";

interface Story {
  id: string;
  title: string;
  status: string;
  assignee: string;
  size: "S" | "M" | "L";
  priority?: string;
  dueDate?: string;
  points?: number;
  epic?: string;
  labels?: string[];
}

interface Epic {
  id: string;
  title: string;
  stories: Story[];
}

interface Item {
  id: string;
  title: string;
  status: string;
  assignee: string;
  size: "S" | "M" | "L";
  priority?: string;
  dueDate?: string;
  points?: number;
  epic?: string;
  labels?: string[];
}

// En lugar de "Datos enriquecidos con campos adicionales"
const backlogData = {
  epics: [
    {
      id: "epic-3",
      title: "Epic 3: Agile Workflow Management and Sprints",
      stories: [
        {
          id: "HU10",
          title: "Assign items to Sprint Backlog",
          status: "Sprint Backlog",
          assignee: "User A",
          size: "L",
          priority: "High",
          dueDate: "2025-05-15",
          points: 8,
          labels: ["Sprint", "Backend"],
        },
        {
          id: "HU11",
          title: "Create and activate a new Sprint",
          status: "Sprint Backlog",
          assignee: "User B",
          size: "M",
          priority: "Medium",
          dueDate: "2025-05-20",
          points: 5,
          labels: ["Sprint", "Frontend"],
        },
      ],
    },
  ],
  userStories: [
    {
      id: "HU20",
      title: "Configure notifications",
      status: "In Progress",
      assignee: "User C",
      size: "S",
      priority: "Low",
      dueDate: "2025-05-10",
      points: 3,
      epic: "epic-3",
      labels: ["Usability"],
    },
  ],
  bugs: [
    {
      id: "BUG15",
      title: "Login error",
      status: "In Review",
      assignee: "User D",
      size: "M",
      priority: "High",
      dueDate: "2025-04-30",
      points: 2,
      epic: "",
      labels: ["Critical", "Frontend"],
    },
  ],
};

// Definición de columnas disponibles
interface ColumnDefinition {
  id: string;
  label: string;
  field: keyof Story;
  width: string;
  render: (item: Story | Item) => React.ReactNode;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "Sprint Backlog":
      return styles.statusSprintBacklog;
    case "In Progress":
      return styles.statusInProgress;
    case "In Review":
      return styles.statusInReview;
    case "Done":
      return styles.statusDone;
    default:
      return styles.statusUnassigned;
  }
};

const getPriorityStyle = (priority: string = "") => {
  switch (priority.toLowerCase()) {
    case "alta":
      return styles.priorityHigh;
    case "media":
      return styles.priorityMedium;
    case "baja":
      return styles.priorityLow;
    default:
      return styles.priorityUnset;
  }
};

const getAvatarUrl = (name: string) => {
  const formattedName = name.replace(/\s+/g, "+");
  return `https://api.dicebear.com/7.x/initials/svg?seed=${formattedName}`;
};

const BacklogTablePage: FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [expandedEpics, setExpandedEpics] = useState<string[]>([]);

  // Definir todas las columnas posibles
  const allColumns: ColumnDefinition[] = [
    {
      id: "title",
      label: "Title",
      field: "title",
      width: "300px", // Ancho aumentado para acomodar títulos más largos
      render: (item) => `${item.title} #${item.id}`,
    },
    {
      id: "status",
      label: "Status",
      field: "status",
      width: "150px",
      render: (item) => (
        <div className={styles.statusContainer}>
          <span className={`${styles.badge} ${getStatusStyle(item.status)}`}>
            {item.status || "Unassigned"}
          </span>
        </div>
      ),
    },
    {
      id: "assignee",
      label: "Assignee",
      field: "assignee",
      width: "180px",
      render: (item) => (
        <div className={styles.assigneeContainer}>
          <img
            src={getAvatarUrl(item.assignee)}
            alt={item.assignee}
            className={styles.avatar}
          />
          <span>{item.assignee || "-"}</span>
        </div>
      ),
    },
    {
      id: "size",
      label: "Size",
      field: "size",
      width: "100px",
      render: (item) => (
        <span className={`${styles.badge} ${styles.sizeBadge}`}>
          {item.size}
        </span>
      ),
    },
    {
      id: "priority",
      label: "Priority",
      field: "priority",
      width: "120px",
      render: (item) => (
        <span className={`${styles.badge} ${getPriorityStyle(item.priority)}`}>
          {item.priority || "Sin prioridad"}
        </span>
      ),
    },
    {
      id: "dueDate",
      label: "Due Date",
      field: "dueDate",
      width: "120px",
      render: (item) => item.dueDate || "-",
    },
    {
      id: "points",
      label: "Points",
      field: "points",
      width: "100px",
      render: (item) => item.points?.toString() || "-",
    },
    {
      id: "labels",
      label: "Labels",
      field: "labels",
      width: "200px",
      render: (item) => (
        <div className={styles.labelsContainer}>
          {item.labels?.map((label, idx) => (
            <span key={idx} className={`${styles.badge} ${styles.labelBadge}`}>
              {label}
            </span>
          )) || "-"}
        </div>
      ),
    },
  ];

  // Estado para las columnas actualmente visibles
  const [activeColumns, setActiveColumns] = useState<string[]>([
    "title",
    "status",
    "assignee",
    "size",
  ]);

  // Función para activar/desactivar columnas
  const toggleColumn = (columnId: string) => {
    if (activeColumns.includes(columnId)) {
      // No permitir remover la columna de título
      if (columnId === "title") return;

      setActiveColumns(activeColumns.filter((id) => id !== columnId));
    } else {
      setActiveColumns([...activeColumns, columnId]);
    }
  };

  // Filtrar solo las columnas activas
  const visibleColumns = allColumns.filter((col) =>
    activeColumns.includes(col.id)
  );

  // Calcular el ancho mínimo de la tabla según las columnas activas
  const tableMinWidth = visibleColumns.reduce(
    (total, col) => total + parseInt(col.width, 10),
    0
  );

  const toggleEpic = (epicId: string) => {
    setExpandedEpics((prev) =>
      prev.includes(epicId)
        ? prev.filter((id) => id !== epicId)
        : [...prev, epicId]
    );
  };

  // Función para renderizar filas de historias - ahora con parámetro isEpicStory
  const renderStoryRow = (
    story: Story | Item,
    index?: number,
    isEpicStory = false
  ) => (
    <tr key={story.id} className={styles.storyRow}>
      {visibleColumns.map((column) => (
        <td
          key={`${story.id}-${column.id}`}
          className={styles[`${column.id}Column`]}
          style={{ width: column.width }}
        >
          {column.id === "title" && isEpicStory && index !== undefined ? (
            <div className={styles.titleWithEpic}>
              <span>{`${index + 1}. ${column.render(story)}`}</span>
            </div>
          ) : (
            column.render(story)
          )}
        </td>
      ))}
    </tr>
  );

  return (
    <div className={styles.backlogTablePageContainer}>
      <div className={styles.backlogTableContent}>
        <div className={styles.headerContainer}>
          <h1>Product Backlog - Project {projectId}</h1>

          <div className={styles.columnControls}>
            <span className={styles.columnControlsLabel}>Columnas:</span>
            <div className={styles.columnButtonsContainer}>
              {allColumns.map((column) => (
                <button
                  key={column.id}
                  className={`${styles.columnToggleButton} ${
                    activeColumns.includes(column.id) ? styles.columnActive : ""
                  }`}
                  onClick={() => toggleColumn(column.id)}
                  disabled={column.id === "title"} // No permitir desactivar la columna de título
                >
                  {column.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <div className={styles.tableContainer} style={{ overflowX: "auto" }}>
            <table
              className={styles.table}
              style={{ minWidth: `${tableMinWidth}px`, tableLayout: "fixed" }}
            >
              <thead>
                <tr>
                  {visibleColumns.map((column) => (
                    <th
                      key={`header-${column.id}`}
                      className={styles[`${column.id}Column`]}
                      style={{ width: column.width }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Sección Épicas */}
                <tr className={styles.sectionHeaderRow}>
                  <td
                    colSpan={visibleColumns.length}
                    className={styles.sectionHeader}
                  >
                    Epics
                  </td>
                </tr>
                {backlogData.epics.map((epic) => (
                  <>
                    <tr
                      key={epic.id}
                      className={styles.epicRow}
                      onClick={() => toggleEpic(epic.id)}
                    >
                      <td
                        colSpan={visibleColumns.length}
                        className={styles.epicTitleCell}
                      >
                        <div className={styles.epicTitle}>
                          <span className={styles.expandIcon}>
                            {expandedEpics.includes(epic.id) ? "▼" : "▶"}
                          </span>
                          <div className={styles.epicTitleText}>
                            <strong>{epic.title}</strong> #{epic.id}
                            <span className={styles.estimateBadge}>
                              {`0/${epic.stories.length}`}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {expandedEpics.includes(epic.id) &&
                      epic.stories.map((story, index) =>
                        renderStoryRow(story, index, true)
                      )}
                  </>
                ))}

                {/* Sección Historias de Usuario */}
                <tr className={styles.sectionHeaderRow}>
                  <td
                    colSpan={visibleColumns.length}
                    className={styles.sectionHeader}
                  >
                    User Stories
                  </td>
                </tr>
                {backlogData.userStories.map((story) => renderStoryRow(story))}

                {/* Sección Bugs */}
                <tr className={styles.sectionHeaderRow}>
                  <td
                    colSpan={visibleColumns.length}
                    className={styles.sectionHeader}
                  >
                    Bugs
                  </td>
                </tr>
                {backlogData.bugs.map((bug) => renderStoryRow(bug))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacklogTablePage;
