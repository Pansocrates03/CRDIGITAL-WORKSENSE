// interfaces/backlog.ts
import { Timestamp, FieldValue } from "firebase-admin/firestore";

// Define allowed backlog item types
interface BacklogItemData {
  acceptanceCriteria?: string[] | null;
  assigneeId?: number | null;
  authorId?: number | null;
  coverImage?: string | null;
  description?: string | null;
  name?: string | null;
  status?: "new" | "toDo" | "inProgress" | "inReview" | "done" | null;
  priority?: "high" | "medium" | "low" | null;
  size?: "XS" | "S" | "M" | "L" | "XL" | null;
  sprint?: string | null;
  type?: "epic" | "story" | "bug" | "techTask" | "knowledge" | null;
  parentId?: string | null;
}

export type { BacklogItemData };
