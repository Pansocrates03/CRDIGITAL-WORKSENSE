// src/components/Backlog/TreeBacklog.tsx
import React, { useState, useEffect, useCallback } from "react";
import apiClient from "../../api/apiClient";
import {
  ChevronDown,
  ChevronRight,
  PlusIcon,
  FileText,
  Layers,
  CheckSquare,
  Bug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "../Loading/LoadingSpinner";
import {
  statusClasses,
  priorityClasses,
  typeClasses,
  hoverRowClass,
} from "./styles";
import { BacklogItemType } from "@/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import ItemDetailView from "./ItemDetailView";

const typeTranslations: { [key: string]: string } = {
  epic: "Epic",
  story: "Story",
  task: "Task",
  bug: "Bug",
  default: "Item",
};

const typeIcons: { [key: string]: React.ReactNode } = {
  epic: <Layers className="h-4 w-4" />,
  story: <FileText className="h-4 w-4" />,
  task: <CheckSquare className="h-4 w-4" />,
  bug: <Bug className="h-4 w-4" />,
};

// Propiedades para el componente TreeNode
interface TreeNodeProps {
  item: BacklogItemType;
  level: number;
  projectID: string;
  onAddSubItem?: (parentItemId: string | null) => void;
}

// Propiedades para el componente TreeBacklog
interface TreeBacklogProps {
  projectID: string;
  searchTerm?: string;
  onAddSubItem?: (parentItemId: string | null) => void;
}

// Componente TreeNode para cada ítem en el árbol
const TreeNode: React.FC<TreeNodeProps> = ({
  item,
  level,
  projectID,
  onAddSubItem,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<BacklogItemType[]>([]);
  const [hasLoadedChildren, setHasLoadedChildren] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const fetchSubItems = useCallback(async () => {
    if (!projectID || !item.id) return;

    setIsLoading(true);
    try {
      console.log(`Fetching subitems for: ${item.id}`);
      const response = await apiClient.get(
        `/items/subitems?projectID=${encodeURIComponent(
          projectID
        )}&parentItemID=${encodeURIComponent(item.id)}`
      );
      const fetchedSubItems = response.data;
      const actualSubItems = fetchedSubItems.filter(
        (sub: any) => sub.id !== "emptyDoc" && !sub.placeholder
      );
      console.log(`Found ${actualSubItems.length} subitems for ${item.id}`);
      setChildren(actualSubItems);
      setHasLoadedChildren(true);
      setHasChildren(actualSubItems.length > 0);
    } catch (err: any) {
      console.error(`Error fetching sub-items for ${item.id}:`, err);
      setHasChildren(false);
    } finally {
      setIsLoading(false);
    }
  }, [projectID, item.id]);

  const toggleExpand = () => {
    const nextExpandedState = !isExpanded;
    setIsExpanded(nextExpandedState);
    if (nextExpandedState && !hasLoadedChildren) {
      fetchSubItems();
    }
  };

  // Cargar información de hijos al montar el componente
  useEffect(() => {
    fetchSubItems();
  }, [fetchSubItems]);

  const handleAddSubItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddSubItem) {
      onAddSubItem(item.id);
    }
  };

  // Format timestamp helper
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "-";

    // Handle Firebase timestamp object
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }

    // Handle ISO string or other formats
    try {
      return new Date(timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "-";
    }
  };

  // Calculate indentation style based on level
  const indentStyle = { paddingLeft: `${level * 24}px` };

  return (
    <>
      <TableRow className={hoverRowClass}>
        {/* Expand Button */}
        <TableCell className="w-[50px] py-2">
          <div style={indentStyle} className="flex items-center gap-2">
            {hasChildren ? (
              <button
                onClick={toggleExpand}
                className="p-1 rounded-full hover:bg-muted/70 dark:hover:bg-neutral-700 transition-colors"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : isExpanded ? (
                  <ChevronDown size={16} className="text-muted-foreground" />
                ) : (
                  <ChevronRight size={16} className="text-muted-foreground" />
                )}
              </button>
            ) : (
              <div className="w-7" />
            )}
          </div>
        </TableCell>

        {/* Nombre + ID + Icono */}
        <TableCell className="py-2">
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded-md"
            onClick={() => setShowDetail(true)}
          >
            {typeIcons[item.tag || "task"]}
            <span
              className="text-sm font-medium text-foreground truncate hover:text-primary transition-colors"
              title={item.name}
            >
              {item.name}{" "}
              <span className="text-xs text-muted-foreground font-normal ml-1">
                #{item.id}
              </span>
            </span>
          </div>
        </TableCell>

        {/* Estado */}
        <TableCell className="text-center py-2">
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-xs whitespace-nowrap ${
              statusClasses[item.status || "todo"]
            }`}
          >
            {item.status || "todo"}
          </span>
        </TableCell>

        {/* Prioridad */}
        <TableCell className="text-center py-2">
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-xs whitespace-nowrap ${
              priorityClasses[item.priority || "medium"]
            }`}
          >
            {item.priority || "medium"}
          </span>
        </TableCell>

        {/* Tamaño */}
        <TableCell className="text-center py-2">
          <span className="text-sm font-medium text-foreground">
            {item.size !== undefined ? item.size : "-"}
          </span>
        </TableCell>

        {/* Fecha */}
        <TableCell className="text-right py-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {formatDate(item.createdAt)}
          </span>
        </TableCell>

        {/* Acciones */}
        <TableCell className="text-right py-2">
          {onAddSubItem && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddSubItem}
              className="h-7 w-7 p-0 hover:bg-muted/70 dark:hover:bg-neutral-700"
              title="Agregar subelemento"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          )}
        </TableCell>
      </TableRow>

      {showDetail && (
        <ItemDetailView
          item={item}
          onClose={() => setShowDetail(false)}
          projectID={projectID}
        />
      )}

      {/* Children container */}
      {isExpanded &&
        children.map((child) => (
          <TreeNode
            key={child.id}
            item={child}
            level={level + 1}
            projectID={projectID}
            onAddSubItem={onAddSubItem}
          />
        ))}
    </>
  );
};

// Componente principal TreeBacklog
const TreeBacklog: React.FC<TreeBacklogProps> = ({
  projectID,
  searchTerm = "",
  onAddSubItem,
}) => {
  const [items, setItems] = useState<BacklogItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch top-level items when component mounts or projectID changes
  useEffect(() => {
    const fetchItems = async () => {
      if (!projectID) return;

      setLoading(true);
      setError(null);

      try {
        console.log(`Loading backlog for project: ${projectID}`);
        // Usar directamente la ruta del backend
        const response = await apiClient.get(`/projects/${projectID}/items`);
        const projectItems = response.data;

        // Filter out placeholder items
        const filteredItems = projectItems.filter(
          (item: any) => !item.placeholder
        );

        setItems(filteredItems);
      } catch (err: any) {
        console.error("Error fetching backlog items:", err);
        setError(err.message || "Error loading backlog items.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [projectID]);

  // Filter items based on search term
  const filteredItems = searchTerm
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.tag &&
            item.tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.status &&
            item.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.priority &&
            item.priority.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : items;

  // Handle adding a new top-level item
  const handleAddTopLevelItem = () => {
    if (onAddSubItem) {
      onAddSubItem(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Cargando backlog..." />;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (filteredItems.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground mb-4">
          {searchTerm
            ? `No se encontraron elementos para "${searchTerm}".`
            : "No hay elementos en el backlog."}
        </p>
        {!searchTerm && onAddSubItem && (
          <Button onClick={handleAddTopLevelItem}>Agregar elemento</Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[50px] font-semibold"></TableHead>
            <TableHead className="font-semibold">Item</TableHead>
            <TableHead className="text-center font-semibold">Status</TableHead>
            <TableHead className="text-center font-semibold">
              Priority
            </TableHead>
            <TableHead className="text-center font-semibold">Size</TableHead>
            <TableHead className="text-right font-semibold">Date</TableHead>
            <TableHead className="text-right font-semibold w-[100px]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => (
            <TreeNode
              key={item.id}
              item={item}
              level={0}
              projectID={projectID}
              onAddSubItem={onAddSubItem}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TreeBacklog;
