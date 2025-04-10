import { BacklogItemType } from "@/types";

// Tipo para la visualización en el árbol
export interface TreeItemType extends BacklogItemType {
  children?: TreeItemType[];
  level?: number;
}

// Props para el componente TreeNode
export interface TreeNodeProps {
  item: TreeItemType;
  level: number;
  projectID: string;
  onAddSubItem?: (parentItemId: string) => void;
}

// Props para el componente TreeBacklog
export interface TreeBacklogProps {
  projectID: string;
  searchTerm?: string;
  onAddSubItem?: (parentItemId: string | null) => void;
}

// Props para el formulario de creación de items
export interface CreateItemFormProps {
  projectId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

// Props para el formulario de creación de subitems
export interface CreateSubItemFormProps extends CreateItemFormProps {
  parentItemId: string;
}

// Props para el modal de backlog
export interface BacklogModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  parentItemId?: string | null;
  onSuccess?: () => void;
}
