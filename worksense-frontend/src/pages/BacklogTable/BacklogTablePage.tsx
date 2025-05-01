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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["backlog", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await apiClient.get(`/${projectId}/backlog/items`);
      return res.data;
    },
    enabled: !!projectId,
  });

  const { data: members = [] } = useQuery<ProjectMember[]>({
    queryKey: ["projectMembers", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await apiClient.get(`/${projectId}/members-detail`);
      return res.data;
    },
    enabled: !!projectId,
  });

  const memberMap = useMemo(() => {
    const map = new Map<number, ProjectMember>();
    members.forEach((m) => m.userId && map.set(m.userId, m));
    return map;
  }, [members]);

  const categorized = useMemo(() => {
    const all = Array.isArray(data) ? data : [];
    return {
      epics: all.filter(i => i.type === "epic"),
      stories: all.filter(i => i.type === "story"),
      standaloneStories: all.filter(i => i.type === "story" && !i.epicId),
      bugs: all.filter(i => i.type === "bug"),
      techTasks: all.filter(i => i.type === "techTask"),
      knowledge: all.filter(i => i.type === "knowledge"),
    };
  }, [data]);

  const handleEdit = (item: BacklogItem) => {
    setItemToEdit(item);
    setIsEditModalOpen(true);
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
    items.filter(matchesSearch).map((item) => (
      <BacklogRow
        key={item.id}
        item={item}
        indent={indent}
        memberMap={memberMap}
        onEdit={() => handleEdit(item)}
        onDelete={() => console.log("delete", item)}
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
                    epic={{ ...epic, stories: categorized.stories.filter(s => s.epicId === epic.id) }}
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
                    onDelete={() => console.log("delete epic", epic)}
                  />
                  {expandedEpics.includes(epic.id) &&
                    renderRows(
                      categorized.stories.filter(s => s.epicId === epic.id),
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
        isOpen={false}
        onClose={() => {}}
        onConfirm={() => {}}
        title=""
        message=""
      />
    </div>
  );
};

export default BacklogTablePage;

