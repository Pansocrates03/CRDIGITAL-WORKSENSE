// src/types/backlog.ts (or wherever you store your type definitions)

export interface User {
  userId: number;
  name?: string;
  nickname?: string;
  profilePicture?: string;
  id?: number; // for compatibility with different API responses
}

export interface Epic {
  id: string;
  title: string;
  stories?: BacklogItem[];
}

export interface BacklogItemFormData {
  id?: string;
  projectId?: string;
  type: "epic" | "story" | "bug" | "techTask" | "knowledge";
  title: string;
  status: string;
  assigneeId?: string | number | null;
  priority: "lowest" | "low" | "medium" | "high" | "highest";
  storyPoints?: number | null;
  severity?: string | null;
  epicId?: string | null;
  linkedItems?: string[] | null;
  // Support both content and description fields for compatibility
  content?: string | null; 
  description?: string | null; // For AI-generated stories
  tags?: string[];
}

export interface BacklogItem extends BacklogItemFormData {
  id: string;
}
  