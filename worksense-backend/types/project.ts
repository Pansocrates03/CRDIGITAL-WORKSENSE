// interfaces/project.ts (CORRECTED VERSION)
import { Timestamp } from "firebase-admin/firestore";

// Define project status type
export type ProjectStatus = "active" | "archived";

// Optional context structure (can be expanded)
export interface ProjectContext {
  techStack?: string[];
  objectives?: string;
}

// Represents a project document in Firestore /projectss/{projectId}
export interface Project {
  projectId: string; // Firestore Document ID
  name: string;
  description: string | null;
  ownerId: number;
  members: ProjectMemberData[];
  status: ProjectStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp; // Added optional updatedAt
  context: ProjectContext | null;
}

export interface ProjectMemberData {
  userId: number; // <<<< ADDED: Store the numeric SQL User ID here
  projectRoleId: string; // <<<< CHANGED: Should be string (e.g., "developer", "product-owner")
  joinedAt: Timestamp;
}

// Represents a complete member object, often used for API responses
// Combines the stored data with the document ID (userId)
export interface ProjectMember extends ProjectMemberData {
  name?: string; // Example: "John Doe"
  fullName?: string; // Example: "John Doe"
  email?: string; // User's email from SQL database
}

// --- Data Transfer Objects (DTOs) for Request Bodies ---

export interface CreateProjectDto {
  name: string;
  description?: string | null;
  context?: ProjectContext | null;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string | null;
  context?: ProjectContext | null;
}

export interface AddMemberDto {
  userId: number; // SQL User ID of the user to add (numeric)
  projectRoleId: string; // ID of the role to assign from /projectRoles (string)
}

export interface UpdateMemberRoleDto {
  projectRoleId: string; // The new role ID (string)
}
