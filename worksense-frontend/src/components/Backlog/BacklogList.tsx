import React, { useEffect, useState, useCallback, useMemo } from "react";
import apiClient from "../../api/apiClient";
import { BacklogTree } from "./BacklogTree";
import { buildTree } from "./helpers";
import { getExampleData } from "./MockData";
import { TreeNodeType } from "./TreeNode";
import { BacklogItemType } from "@/types";

const API_URL = "http://localhost:5050"; // URL base del backend

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

  useEffect(() => {
    const fetchBacklogItems = async () => {
      setLoading(true);
      setError(null);
      let fetchedItems: BacklogItemType[] = [];
      try {
        console.log(`Loading backlog for project: ${projectId}`);
        const response = await apiClient.get(`${API_URL}/items`);
        const allData = response.data;
        const projectItems = allData.filter(
          (item: any) => item.projectID === projectId && !item.placeholder
        );

        if (!projectItems || projectItems.length === 0) {
          console.warn("No backlog items found (API), using example data");
          fetchedItems = getExampleData(projectId);
        } else {
          fetchedItems = projectItems.map((item: any) => ({
            id: item.id,
            projectID: item.projectID,
            parentId: item.parentId || null,
            type: item.type || "epic",
            name: item.name || "Unnamed",
            description: item.description || "",
            status: item.status || item.sstatus || "backlog",
            priority: item.priority || "medium",
            createdAt: item.createdAt
              ? typeof item.createdAt === "string"
                ? item.createdAt
                : new Date(item.createdAt._seconds * 1000).toISOString()
              : new Date().toISOString(),
            updatedAt: item.updatedAt
              ? typeof item.updatedAt === "string"
                ? item.updatedAt
                : new Date(item.updatedAt._seconds * 1000).toISOString()
              : new Date().toISOString(),
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
          }));
        }
        setAllItems(fetchedItems);
      } catch (err) {
        console.error("Error fetching backlog items:", err);
        console.log("Using example data due to API error");
        fetchedItems = getExampleData(projectId);
        setAllItems(fetchedItems);
        setError("Error loading backlog items. Displaying example data.");
      } finally {
        setLoading(false);
      }
    };

    fetchBacklogItems();
  }, [projectId]);

  useEffect(() => {
    if (loading) return;

    const lowerSearchTerm = searchTerm.toLowerCase();

    const filterNodes = (items: BacklogItemType[]): BacklogItemType[] => {
      const matchingItems: BacklogItemType[] = [];
      const itemMap = new Map(items.map((item) => [item.id, item]));
      const childrenMap = new Map<string, BacklogItemType[]>();

      items.forEach((item) => {
        if (item.parentId) {
          if (!childrenMap.has(item.parentId)) {
            childrenMap.set(item.parentId, []);
          }
          childrenMap.get(item.parentId)?.push(item);
        }
      });

      const checkMatch = (item: BacklogItemType): boolean => {
        const selfMatch =
          item.name.toLowerCase().includes(lowerSearchTerm) ||
          item.id.toLowerCase().includes(lowerSearchTerm) ||
          (item.type && item.type.toLowerCase().includes(lowerSearchTerm)) ||
          (item.status &&
            item.status.toLowerCase().includes(lowerSearchTerm)) ||
          (item.priority &&
            item.priority.toLowerCase().includes(lowerSearchTerm));

        const children = childrenMap.get(item.id) || [];
        const descendantMatch = children.some((child) => checkMatch(child));

        return selfMatch || descendantMatch;
      };

      items.forEach((item) => {
        if (checkMatch(item)) {
          matchingItems.push(item);
        }
      });

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

    const filteredItems = lowerSearchTerm ? filterNodes(allItems) : allItems;
    const treeData = buildTree(filteredItems);
    setFilteredTree(treeData);

    if (lowerSearchTerm && filteredItems.length > 0) {
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
    } else if (!lowerSearchTerm) {
      const initialExpanded = new Set(treeData.map((node) => node.id));
      setExpandedIds(initialExpanded);
    }
  }, [searchTerm, allItems, loading]);

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
