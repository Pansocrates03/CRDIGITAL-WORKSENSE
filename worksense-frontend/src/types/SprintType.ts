// src/types/SprintType.ts (Example)
export interface Sprint {
  columns: string[];
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