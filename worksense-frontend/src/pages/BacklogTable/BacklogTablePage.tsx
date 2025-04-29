// src/pages/BacklogTable/BacklogTablePage.tsx
import React, { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/apiClient";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";
import { EpicRow } from "@/components/BacklogTable/EpicRow";
import styles from "./BacklogTablePage.module.css";

interface BacklogItem {
  id: string;
  projectId: string;
  type: "epic" | "story" | "bug" | "techTask" | "knowledge";
  title: string;
  status: string;
  assigneeId?: string | number | null;
  size?: "S" | "M" | "L";
  epicId?: string | null;
}

const BacklogTablePage: FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [expandedEpics, setExpandedEpics] = useState<string[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["backlog", projectId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/${projectId}/backlog/items`);
      return res.data;
    },
    enabled: !!projectId,
  });

  if (isLoading) return <LoadingSpinner text="Loading backlog..." />;
  if (error) return <p style={{ color: "red" }}>Failed to load backlog.</p>;

  const items: BacklogItem[] = Array.isArray(data) ? data : [];

  const epics = items.filter((i) => i.type === "epic");
  const stories = items.filter((i) => i.type === "story");
  const bugs = items.filter((i) => i.type === "bug");
  const techTasks = items.filter((i) => i.type === "techTask");
  const knowledge = items.filter((i) => i.type === "knowledge");

  const standaloneStories = stories.filter((s) => !s.epicId);

  const toggleEpic = (epicId: string) => {
    setExpandedEpics((prev) =>
      prev.includes(epicId)
        ? prev.filter((id) => id !== epicId)
        : [...prev, epicId]
    );
  };

  const renderRow = (item: BacklogItem, indent = false) => (
    <tr key={item.id}>
      <td style={{ paddingLeft: indent ? "2rem" : undefined }}>{item.title}</td>
      <td>{item.status}</td>
      <td>{item.assigneeId ?? "Unassigned"}</td>
      <td>{item.size ?? "-"}</td>
    </tr>
  );

  return (
    <div className={styles.backlogPageContainer}>
      <div className="flex items-baseline justify-between w-full mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Product Backlog
          </h2>
          <p className="text-muted-foreground mt-1">
            Track and manage epics, stories, bugs and technical work.
          </p>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
            {/* Epics */}
            <tr>
              <td colSpan={4} className={styles.sectionHeader}>
                Epics
              </td>
            </tr>
            {epics.length === 0 ? (
              <tr>
                <td colSpan={4}>No epics found</td>
              </tr>
            ) : (
              epics.map((epic) => {
                const epicStories = stories.filter((s) => s.epicId === epic.id);
                return (
                  <React.Fragment key={epic.id}>
                    <EpicRow
                      epic={{ ...epic, stories: epicStories }}
                      isExpanded={expandedEpics.includes(epic.id)}
                      onToggle={toggleEpic}
                      colSpan={4}
                    />
                    {expandedEpics.includes(epic.id) &&
                      epicStories.map((story) => renderRow(story, true))}
                  </React.Fragment>
                );
              })
            )}

            {/* User Stories */}
            <tr>
              <td colSpan={4} className={styles.sectionHeader}>
                User Stories
              </td>
            </tr>
            {standaloneStories.length === 0 ? (
              <tr>
                <td colSpan={4}>No standalone stories found</td>
              </tr>
            ) : (
              standaloneStories.map((s) => renderRow(s))
            )}

            {/* Bugs */}
            <tr>
              <td colSpan={4} className={styles.sectionHeader}>
                Bugs
              </td>
            </tr>
            {bugs.length === 0 ? (
              <tr>
                <td colSpan={4}>No bugs found</td>
              </tr>
            ) : (
              bugs.map((b) => renderRow(b))
            )}

            {/* Tech Tasks */}
            <tr>
              <td colSpan={4} className={styles.sectionHeader}>
                Tech Tasks
              </td>
            </tr>
            {techTasks.length === 0 ? (
              <tr>
                <td colSpan={4}>No tech tasks found</td>
              </tr>
            ) : (
              techTasks.map((t) => renderRow(t))
            )}

            {/* Knowledge */}
            <tr>
              <td colSpan={4} className={styles.sectionHeader}>
                Knowledge Items
              </td>
            </tr>
            {knowledge.length === 0 ? (
              <tr>
                <td colSpan={4}>No knowledge items found</td>
              </tr>
            ) : (
              knowledge.map((k) => renderRow(k))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BacklogTablePage;
