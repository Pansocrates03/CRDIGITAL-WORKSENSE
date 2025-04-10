import React, { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";
import TreeBacklog from "./TreeBacklog";
import { getExampleData } from "./mockData";
import { BacklogItemType } from "@/types";
import LoadingSpinner from "../Loading/LoadingSpinner";

interface BacklogListProps {
  projectId: string;
  searchTerm: string;
  onAddSubItem?: (parentItemId: string | null) => void;
}

export const BacklogList: React.FC<BacklogListProps> = ({
  projectId,
  searchTerm,
  onAddSubItem,
}) => {
  const [allItems, setAllItems] = useState<BacklogItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch backlog items when projectId changes
  useEffect(() => {
    const fetchBacklogItems = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Loading backlog for project: ${projectId}`);
        // Usar directamente la ruta del backend
        const response = await apiClient.get(`/projects/${projectId}/items`);
        const projectItems = response.data;

        if (!projectItems || projectItems.length === 0) {
          console.warn("No backlog items found (API), using example data");
          setAllItems(getExampleData(projectId));
        } else {
          const normalizedItems = projectItems.map(normalizeBacklogItem);
          setAllItems(normalizedItems);
        }
      } catch (err) {
        console.error("Error fetching backlog items:", err);
        console.log("Using example data due to API error");
        setAllItems(getExampleData(projectId));
        setError("Error loading backlog items. Displaying example data.");
      } finally {
        setLoading(false);
      }
    };

    fetchBacklogItems();
  }, [projectId]);

  // Helper function to normalize API item format
  const normalizeBacklogItem = (item: any): BacklogItemType => ({
    id: item.id,
    projectID: item.projectID,
    parentId: item.parentId || null,
    type: item.type || "epic",
    name: item.name || "Unnamed",
    description: item.description || "",
    status: item.status || item.sstatus || "backlog",
    priority: item.priority || "medium",
    createdAt: formatTimestamp(item.createdAt),
    updatedAt: formatTimestamp(item.updatedAt),
    size: item.size || 0,
    tag: item.tag || "",
    author: item.author || "",
    asignee: Array.isArray(item.asignee)
      ? item.asignee
      : item.asignee
      ? [item.asignee]
      : [],
    acceptanceCriteria: Array.isArray(item.acceptanceCriteria)
      ? item.acceptanceCriteria
      : item.acceptanceCriteria
      ? [item.acceptanceCriteria]
      : [],
  });

  // Helper function to format timestamps
  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return new Date().toISOString();

    if (typeof timestamp === "string") return timestamp;

    return timestamp._seconds
      ? new Date(timestamp._seconds * 1000).toISOString()
      : new Date().toISOString();
  };

  // Render functions
  if (loading) {
    return <LoadingSpinner text="Loading backlog..." />;
  }

  if (error && allItems.length === 0) {
    return (
      <div>
        <div className="text-yellow-500 mb-2">{error}</div>
        <TreeBacklog
          projectID={projectId}
          searchTerm={searchTerm}
          onAddSubItem={onAddSubItem}
        />
      </div>
    );
  }

  return (
    <TreeBacklog
      projectID={projectId}
      searchTerm={searchTerm}
      onAddSubItem={onAddSubItem}
    />
  );
};

export default BacklogList;
