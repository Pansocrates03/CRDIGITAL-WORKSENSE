// src/components/BacklogTable/BacklogTable.tsx
import { FC, useMemo } from "react";
import { BacklogData, ColumnDefinition, Story, Item } from "./types";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { AssigneeDisplay } from "./AssigneeDisplay";
import { LabelsList } from "./LabelsList";
import { SectionHeader } from "./SectionHeader";
import { EpicRow } from "./EpicRow";
import { StoryRow } from "./StoryRow";
import styles from "./BacklogTable.module.css";

interface BacklogTableProps {
  data: BacklogData;
  activeColumns: string[];
  expandedEpics: string[];
  onToggleEpic: (epicId: string) => void;
}

export const BacklogTable: FC<BacklogTableProps> = ({
  data,
  activeColumns,
  expandedEpics,
  onToggleEpic,
}) => {
  // Definir todas las columnas posibles
  const allColumns: ColumnDefinition[] = useMemo(
    () => [
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
        render: (item) => <StatusBadge status={item.status} />,
      },
      {
        id: "assignee",
        label: "Assignee",
        field: "assignee",
        width: "180px",
        render: (item) => <AssigneeDisplay assignee={item.assignee} />,
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
        render: (item) => <PriorityBadge priority={item.priority} />,
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
        render: (item) => <LabelsList labels={item.labels} />,
      },
    ],
    []
  );

  // Filtrar solo las columnas activas
  const visibleColumns = useMemo(
    () => allColumns.filter((col) => activeColumns.includes(col.id)),
    [allColumns, activeColumns]
  );

  return (
    <div className={styles.backlogTableContainer}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th
                  key={`header-${column.id}`}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Sección Épicas */}
            <SectionHeader title="Epics" colSpan={visibleColumns.length} />
            
            {data.epics.map((epic) => (
              <>
                <EpicRow 
                  key={epic.id}
                  epic={epic}
                  isExpanded={expandedEpics.includes(epic.id)}
                  onToggle={onToggleEpic}
                  colSpan={visibleColumns.length}
                />
                
                {expandedEpics.includes(epic.id) &&
                  epic.stories.map((story, index) => (
                    <StoryRow
                      key={`epic-story-${story.id}`}
                      item={story}
                      columns={visibleColumns}
                      index={index}
                      isEpicStory={true}
                    />
                  ))}
              </>
            ))}

            {/* Sección Historias de Usuario */}
            <SectionHeader title="User Stories" colSpan={visibleColumns.length} />
            
            {data.userStories.map((story) => (
              <StoryRow
                key={`story-${story.id}`}
                item={story}
                columns={visibleColumns}
              />
            ))}

            {/* Sección Bugs */}
            <SectionHeader title="Bugs" colSpan={visibleColumns.length} />
            
            {data.bugs.map((bug) => (
              <StoryRow
                key={`bug-${bug.id}`}
                item={bug}
                columns={visibleColumns}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};