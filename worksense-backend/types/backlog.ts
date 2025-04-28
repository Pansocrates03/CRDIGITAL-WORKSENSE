// interfaces/backlog.ts
import { Timestamp, FieldValue } from "firebase-admin/firestore";

// Define allowed backlog item types
export type BacklogItemType =
  | "epic"
  | "story"
  | "bug"
  | "techTask"
  | "knowledge";

// Define common priority levels
export type Priority = "lowest" | "low" | "medium" | "high" | "highest";

// Define common status values (can be customized per type later if needed)
// Keep simple for now, expand as needed.
export type BacklogStatus =
  | "new"
  | "todo"
  | "refining"
  | "ready"
  | "in-progress"
  | "review"
  | "done"
  | "archived" // General / Story
  | "confirmed"
  | "resolved"
  | "closed"
  | "reopened" // Bug specific additions
  | "blocked"
  | "active"
  | "archived"; // Common

// Base interface for common fields
export interface BacklogItemBase {
  id?: string; // Firestore Document ID
  projectId: string; // Store project ID for potential collection group queries
  type: BacklogItemType;
  title: string;
  description: string | null;
  priority: Priority;
  reporterId: number; // SQL User ID
  assigneeId: number | null; // SQL User ID
  status: BacklogStatus;
  createdAt: Timestamp | FieldValue; // Allow FieldValue on creation/update
  updatedAt: Timestamp | FieldValue;
  // Optional relationship tracking
  linkedItems?: {
    [linkId: string]: {
      // Auto-generated link ID
      targetItemId: string;
      targetItemType: BacklogItemType;
      relationship: string; // e.g., "relates to", "blocks", "contains"
    };
  } | null;
}

// Specific Interfaces (add unique fields)
export interface Epic extends BacklogItemBase {
  type: "epic";
  status: "new" | "in-progress" | "done" | "archived"; // Epic-specific status subset
}

export interface Story extends BacklogItemBase {
  type: "story";
  epicId: string | null; // Reference to Epic document ID
  storyPoints: number | null;
  status:
    | "todo"
    | "refining"
    | "ready"
    | "in-progress"
    | "review"
    | "done"
    | "archived"; // Story-specific statuses
}

export interface Bug extends BacklogItemBase {
  type: "bug";
  linkedStoryId: string | null; // Optional reference to Story document ID
  severity: "trivial" | "minor" | "major" | "critical" | "blocker";
  status:
    | "new"
    | "confirmed"
    | "in-progress"
    | "review"
    | "resolved"
    | "closed"
    | "reopened"; // Bug statuses
}

export interface TechTask extends BacklogItemBase {
  type: "techTask";
  linkedStoryId: string | null;
  status: "todo" | "in-progress" | "review" | "done" | "blocked"; // Task statuses
}

export interface Knowledge extends BacklogItemBase {
  type: "knowledge";
  content: string; // Markdown, URL, etc.
  tags: string[] | null;
  status: "active" | "archived";
}

// Union type for any backlog item
export type BacklogItem = Epic | Story | Bug | TechTask | Knowledge;

// --- DTOs for Unified Endpoint ---

// Base DTO excluding server-set fields and type (type provided separately)
// Use Partial for flexibility, specific required fields handled in validation
export type BacklogItemDataDto = Partial<
  Omit<
    BacklogItem,
    "id" | "projectId" | "type" | "reporterId" | "createdAt" | "updatedAt"
  >
>;

// DTO for creating an item
export interface CreateBacklogItemDto extends BacklogItemDataDto {
  type: BacklogItemType; // Type is required on creation
  title: string; // Title is likely always required
  // Add other non-optional fields common to most types if needed
}

// DTO for updating an item (all fields optional)
export interface UpdateBacklogItemDto extends BacklogItemDataDto {
  // No additional required fields, all are partial from BacklogItemDataDto
}
