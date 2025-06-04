import { Timestamp } from "firebase-admin/firestore";
import { BacklogItemData } from "./backlog.js";

// Estados posibles para items en el sprint board
export type SprintItemStatus = "todo" | "in-progress" | "review" | "done";

// Estados posibles para un sprint
export type SprintStatus = "active" | "planned" | "completed";

// Interfaz para las métricas del sprint al completarse
export interface SprintCompletionMetrics {
  totalItems: number;
  completedItems: number;
  itemsByStatus: {
    todo: number;
    "in-progress": number;
    review: number;
    done: number;
  };
}

// Interfaz para un sprint
export interface Sprint {
  projectId: string;
  name: string | null;
  goal: string | null;
  startDate: Timestamp;
  endDate: Timestamp;
  status: SprintStatus;
  completedAt?: Timestamp;
  completionMetrics?: SprintCompletionMetrics;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Interfaz base para items en el sprint board
export interface Assignee {
  id: string | number; // User ID
  name?: string; // User's display name
  avatarUrl?: string; // URL to user's profile picture
}

export interface ApiResponseTask {
  // === Core Identifiers ===
  /** The unique ID of this specific task/sprint item document (e.g., Firestore Document ID). REQUIRED by TaskCard (for key prop). */
  id: string | number;
  /** ID of the project this task belongs to (from backend context). Useful for frontend routing/API calls. */
  projectId: string;
  /** ID of the sprint this task is currently assigned to (from backend context). Useful for frontend filtering/API calls. */
  sprintId: string | null; // Can be null if not in a sprint
  /** ID of the original backlog item this task might be derived from (from backend context). Useful for context/linking. */
  backlogId: string;

  // === Core Display Data (Needed by TaskCard) ===
  /** The main text title of the task card. */
  title: string;
  /** The current status label (e.g., "ToDo", "InProgress", "Done"). */
  status: string;
  /** The priority label (e.g., "High", "Medium", "Low") or null if none. */
  priority: string | null;
  /** The type of item (e.g., 'Story', 'Bug', 'Task'). Useful for icons/filtering. */
  type: string; // Keep this from backend context

  // === Assignees (Transformation Required) ===
  /** Array of assignee objects. REQUIRED by TaskCard. Backend needs to fetch user details based on assigneeId. */
  assignees: Assignee[]; // Transformed from assigneeId

  // === Subtasks & Progress (Needed by TaskCard) ===
  /** Number of completed subtasks. */
  subtasksCompleted: number;
  /** Total number of subtasks. */
  subtasksTotal: number;

  // === Optional Display Data (Needed by TaskCard if available) ===
  /** Optional URL for a cover image displayed at the top. */
  coverImageUrl: string | null; // ADD this field (fetch from DB if exists)
  /** Start date for the task. */
  startDate: Date | string | number | null; // ADD this field (fetch from DB if exists)
  /** End/Due date for the task. */
  endDate: Date | string | number | null; // ADD this field (fetch from DB if exists)

  // === Meta Counts (Needed by TaskCard if available) ===
  /** Number of comments associated with the task. */
  commentsCount: number; // ADD this field (calculate/fetch count)
  /** Number of links or attachments associated with the task. */
  linksCount: number; // ADD this field (calculate/fetch count)

  // === Additional Context (From Backend - Potentially Useful on Frontend) ===
  /** Full description text (likely used in a modal/detail view). */
  description: string | null;
  /** Order within its column/sprint (useful for frontend rendering order). */
  order: number;
  /** Timestamp of when the task was created (useful for display or sorting). Convert Firestore Timestamp to ISO string or number. */
  createdAt: any; // Transformed from Firestore Timestamp
  /** Timestamp of the last update (useful for display or sorting). Convert Firestore Timestamp to ISO string or number. */
  updatedAt: any; // Transformed from Firestore Timestamp

  // --- Deprecated / Handled Differently ---
  // assigneeId: string | null; // No longer needed directly if 'assignees' array is present
}

// DTO para crear un item en el sprint
export interface CreateSprintItemDTO {
  backlogId: string;
  type: string;
  assigneeId?: number | null;
}

// DTO para actualizar un item en el sprint
export interface UpdateSprintItemDTO {
  status?: SprintItemStatus;
  sprintAssigneeId?: number | null;
  order?: number;
}

// DTO for updating sprint status
export interface UpdateSprintStatusDTO {
  status: SprintStatus;
}
