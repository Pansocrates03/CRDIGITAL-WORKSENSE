// src/components/BacklogTable/BacklogTable.tsx
import { FC, useMemo } from "react";
import { BacklogData, ColumnDefinition } from "./types";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { AssigneeDisplay } from "./AssigneeDisplay";
import { LabelsList } from "./LabelsList";
import { SectionHeader } from "./SectionHeader";
import { EpicRow } from "./EpicRow";
import { StoryRow } from "./StoryRow";
import styles from "./BacklogTable.module.css";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";

interface BacklogTableProps {
  data?: BacklogData;
  activeColumns: string[];
  expandedEpics: string[];
  onToggleEpic: (epicId: string) => void;
  isLoading: boolean;
}

export const BacklogTable: FC<BacklogTableProps> = ({
  data,
  activeColumns,
  expandedEpics,
  onToggleEpic,
  isLoading,
}) => {
  const allColumns: ColumnDefinition[] = useMemo(
    () => [
      {
        id: "title",
        label: "Title",
        field: "title",
        width: "300px",
        render: (item) => `${item.title || '-'}`,
      },
      {
        id: "status",
        label: "Status",
        field: "status",
        width: "150px",
        render: (item) => <StatusBadge status={item.status || "unassigned"} />,
      },
      {
        id: "assignee",
        label: "Assignee",
        field: "assignee",
        width: "180px",
        render: (item) => <AssigneeDisplay assignee={item.assignee || "-"} />,
      },
      {
        id: "size",
        label: "Size",
        field: "size",
        width: "100px",
        render: (item) => (
          <span className={`${styles.badge} ${styles.sizeBadge}`}>
            {item.size || "-"}
          </span>
        ),
      },
      {
        id: "priority",
        label: "Priority",
        field: "priority",
        width: "120px",
        render: (item) => <PriorityBadge priority={item.priority || "-"} />,
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

  const visibleColumns = useMemo(
    () => allColumns.filter((col) => activeColumns.includes(col.id)),
    [allColumns, activeColumns]
  );

  if (isLoading) {
    return (
      <div className={styles.backlogTableContainer}>
        <LoadingSpinner text="Loading backlog..." size="medium" fullScreen={false} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.backlogTableContainer}>
        <div className={styles.tableContainer}>
          <p>No backlog data available.</p>
        </div>
      </div>
    );
  }

  const renderEmptyRow = (text: string) => (
    <tr>
      <td colSpan={visibleColumns.length} style={{ textAlign: "center", padding: "1rem", color: "#666" }}>
        {text}
      </td>
    </tr>
  );

  return (
    <div className={styles.backlogTableContainer}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th key={`header-${column.id}`} style={{ width: column.width }}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Epics */}
            <SectionHeader title="Epics" colSpan={visibleColumns.length} />
            {data.epics.length === 0
              ? renderEmptyRow("No epics found")
              : data.epics.flatMap((epic) => {
                  const rows = [
                    <EpicRow
                      key={`epic-${epic.id}`}
                      epic={epic}
                      isExpanded={expandedEpics.includes(epic.id)}
                      onToggle={onToggleEpic}
                      colSpan={visibleColumns.length}
                    />
                  ];
                  if (expandedEpics.includes(epic.id)) {
                    rows.push(
                      ...epic.stories.map((story, index) => (
                        <StoryRow
                          key={`epic-story-${story.id}`}
                          item={story}
                          columns={visibleColumns}
                          index={index}
                          isEpicStory
                        />
                      ))
                    );
                  }
                  return rows;
                })
            }

            {/* User Stories */}
            <SectionHeader title="User Stories" colSpan={visibleColumns.length} />
            {data.userStories.length === 0
              ? renderEmptyRow("No user stories found")
              : data.userStories.map((story) => (
                  <StoryRow
                    key={`story-${story.id}`}
                    item={story}
                    columns={visibleColumns}
                  />
              ))
            }

            {/* Bugs */}
            <SectionHeader title="Bugs" colSpan={visibleColumns.length} />
            {data.bugs.length === 0
              ? renderEmptyRow("No bugs found")
              : data.bugs.map((bug) => (
                  <StoryRow
                    key={`bug-${bug.id}`}
                    item={bug}
                    columns={visibleColumns}
                  />
              ))
            }

            {/* Tech Tasks */}
            <SectionHeader title="Tech Tasks" colSpan={visibleColumns.length} />
            {data.techTasks.length === 0
              ? renderEmptyRow("No tech tasks found")
              : data.techTasks.map((task) => (
                  <StoryRow
                    key={`task-${task.id}`}
                    item={task}
                    columns={visibleColumns}
                  />
              ))
            }

            {/* Knowledge Items */}
            <SectionHeader title="Knowledge Items" colSpan={visibleColumns.length} />
            {data.knowledge.length === 0
              ? renderEmptyRow("No knowledge items found")
              : data.knowledge.map((item) => (
                  <StoryRow
                    key={`knowledge-${item.id}`}
                    item={item}
                    columns={visibleColumns}
                  />
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};
