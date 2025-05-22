export default interface BacklogItemType {
  id: string;
  projectId: string;
  acceptanceCriteria?: string[] | null;
  assigneeId?: number | null;
  authorId?: number | null;
  coverImage?: string | null;
  description?: string | null;
  name?: string | null;
  status?: string | null; // default: ""new" | "toDo" | "inProgress" | "inReview" | "done""
  priority?: "high" | "medium" | "low" | null;
  size?: "XS" | "S" | "M" | "L" | "XL" | null;
  sprint?: string | null;
  type?: "epic" | "story" | "bug" | "techTask" | "knowledge" | null;
  createdAt?: string;
  updatedAt?: string;
  subItems?: BacklogItemType[];
  isSubItem?: boolean;
  parentId?: string;
  tasks?: string[]
}
