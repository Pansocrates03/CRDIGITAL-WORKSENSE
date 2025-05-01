import { Timestamp } from "firebase-admin/firestore";
import { BacklogItemType } from "./backlog.js";

// Estados posibles para items en el sprint board
export type SprintItemStatus = "todo" | "in-progress" | "review" | "done";

// Interfaz base para items en el sprint board
export interface SprintItem {
  // Campos de referencia al item original
  type: BacklogItemType;
  originalId: string; // ID del item en el backlog
  originalType: string; // Tipo del item en el backlog

  // Campos específicos del sprint
  status: SprintItemStatus;
  sprintAssigneeId: number | null;
  order: number; // Para ordenamiento dentro de la columna

  // Campos de auditoría
  addedAt: Timestamp;
  updatedAt: Timestamp;
}

// DTO para crear un item en el sprint
export interface CreateSprintItemDTO {
  backlogId: string;
  assigneeId?: number | null;
}

// DTO para actualizar un item en el sprint
export interface UpdateSprintItemDTO {
  status?: SprintItemStatus;
  sprintAssigneeId?: number | null;
  order?: number;
}
