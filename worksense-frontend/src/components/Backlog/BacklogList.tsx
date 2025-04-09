import React, { useEffect, useState, useCallback } from "react";
import apiClient from "../../api/apiClient";
import { BacklogTree } from "./BacklogTree";
import { buildTree } from "./helpers";
import { getExampleData } from "./MockData";
import { TreeNodeType } from "./TreeNode";
import { BacklogItemType } from "@/types";

interface BacklogListProps {
  projectId: string;
  searchTerm: string;
}

export const BacklogList: React.FC<BacklogListProps> = ({
  projectId,
  searchTerm,
}) => {
  const [allItems, setAllItems] = useState<BacklogItemType[]>([]);
  const [filteredTree, setFilteredTree] = useState<TreeNodeType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Fetch backlog items when projectId changes
  useEffect(() => {
    const fetchBacklogItems = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Loading backlog for project: ${projectId}`);
        // Use apiClient without re-specifying the base URL
        const response = await apiClient.get(`/items`);
        const allData = response.data;
        const projectItems = allData.filter(
          (item: any) => item.projectID === projectId && !item.placeholder
        );

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

  // Filter and build tree when search term or items change
  useEffect(() => {
    if (loading) return;

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filteredItems = lowerSearchTerm
      ? filterBacklogItems(allItems, lowerSearchTerm)
      : allItems;

    const treeData = buildTree(filteredItems);
    setFilteredTree(treeData);

    // Handle expansion state based on search results
    updateExpansionState(treeData, lowerSearchTerm);
  }, [searchTerm, allItems, loading]);

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

  // Filter items based on search term
  const filterBacklogItems = (
    items: BacklogItemType[],
    searchTerm: string
  ): BacklogItemType[] => {
    const matchingItems: BacklogItemType[] = [];
    const itemMap = new Map(items.map((item) => [item.id, item]));
    const childrenMap = new Map<string, BacklogItemType[]>();

    // Build parent-child relationships map
    items.forEach((item) => {
      if (item.parentId) {
        if (!childrenMap.has(item.parentId)) {
          childrenMap.set(item.parentId, []);
        }
        childrenMap.get(item.parentId)?.push(item);
      }
    });

    // Check if item or any descendants match search criteria
    const checkMatch = (item: BacklogItemType): boolean => {
      const selfMatch =
        item.name.toLowerCase().includes(searchTerm) ||
        item.id.toLowerCase().includes(searchTerm) ||
        (item.type && item.type.toLowerCase().includes(searchTerm)) ||
        (item.status && item.status.toLowerCase().includes(searchTerm)) ||
        (item.priority && item.priority.toLowerCase().includes(searchTerm));

      const children = childrenMap.get(item.id) || [];
      const descendantMatch = children.some((child) => checkMatch(child));

      return selfMatch || descendantMatch;
    };

    // Collect all matching items
    items.forEach((item) => {
      if (checkMatch(item)) {
        matchingItems.push(item);
      }
    });

    // Include parents of matching items
    const finalItems = new Set<BacklogItemType>(matchingItems);
    matchingItems.forEach((item) => {
      let current = item;
      while (current.parentId && itemMap.has(current.parentId)) {
        const parent = itemMap.get(current.parentId);
        if (parent && !finalItems.has(parent)) {
          finalItems.add(parent);
          current = parent;
        } else {
          break;
        }
      }
    });

    return Array.from(finalItems);
  };

  // Update expansion state based on search results
  const updateExpansionState = (
    treeData: TreeNodeType[],
    searchTerm: string
  ) => {
    if (searchTerm && treeData.length > 0) {
      const newExpanded = new Set<string>();
      const addExpanded = (nodes: TreeNodeType[]) => {
        nodes.forEach((node) => {
          if (node.children.length > 0) {
            newExpanded.add(node.id);
            addExpanded(node.children);
          }
        });
      };
      addExpanded(treeData);
      setExpandedIds(newExpanded);
    } else if (!searchTerm) {
      // Only expand top-level items when no search
      const initialExpanded = new Set(treeData.map((node) => node.id));
      setExpandedIds(initialExpanded);
    }
  };

  // Toggle node expansion
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Render functions
  if (loading) {
    return <div>Loading backlog...</div>;
  }

  if (error && filteredTree.length === 0) {
    return (
      <div>
        <div className="text-yellow-500 mb-2">{error}</div>
        {allItems.length > 0 && (
          <BacklogTree
            tree={buildTree(getExampleData(projectId))}
            expandedIds={expandedIds}
            toggleExpand={toggleExpand}
          />
        )}
      </div>
    );
  }

  if (!loading && filteredTree.length === 0 && searchTerm) {
    return <div>No items found for "{searchTerm}".</div>;
  }

  if (!loading && allItems.length === 0 && !error) {
    return <div>There are no backlog items to display.</div>;
  }

  return (
    <BacklogTree
      tree={filteredTree}
      expandedIds={expandedIds}
      toggleExpand={toggleExpand}
    />
  );
};

export default BacklogList;
