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
  size?: "xs" | "s" | "m" | "l" | "xl" | null;
  sprint?: string | null;
  type?: "epic" | "story" | "bug" | "techTask" | "knowledge" | null;
}

export type { BacklogItemData };
