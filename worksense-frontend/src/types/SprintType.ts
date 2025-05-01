// src/types/SprintType.ts (Example)
export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string | null;
  startDate?: string | number | Date | null; // Use consistent format (ISO string recommended)
  endDate?: string | number | Date | null; // Use consistent format
  status: "Planned" | "Active" | "Completed"; // Or your specific statuses
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
}

// src/types/TaskType.ts or similar (You should already have this)
// Re-posting the structure for clarity
interface Assignee {
  id: string | number;
  name?: string;
  avatarUrl?: string;
}

export interface ApiResponseTask {
  id: string | number;
  projectId: string;
  sprintId: string | null;
  backlogId: string;
  title: string;
  status: string;
  priority: string | null;
  type: string;
  assignees: Assignee[]; // IMPORTANT: Needs to be fetched/transformed by backend
  subtasksCompleted: number;
  subtasksTotal: number;
  coverImageUrl: string | null;
  startDate: Date | string | number | null;
  endDate: Date | string | number | null;
  commentsCount: number;
  linksCount: number;
  description: string | null;
  order: number;
  createdAt: string | number; // Transformed timestamp
  updatedAt: string | number; // Transformed timestamp
}
