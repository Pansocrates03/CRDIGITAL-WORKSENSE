// interfaces/permissions.ts

/**
 * Represents a single, granular permission available within the system.
 * The document ID in Firestore should ideally match the 'key'.
 */
export interface AvailablePermission {
  id?: string; // Firestore Document ID (e.g., "view:project")
  key: string; // The permission string identifier (e.g., "view:project")
  description: string; // User-friendly explanation (e.g., "Allows viewing project details")
  category: string; // Grouping for UI organization (e.g., "General", "Backlog", "Admin")
}

/**
 * Represents a role that can be assigned to users within a project.
 * Contains a list of permission keys granted by this role.
 */
export interface ProjectRole {
  id?: string; // Firestore Document ID (e.g., "product-owner-role-id")
  name: string; // User-friendly role name (e.g., "Product Owner")
  permissions: string[]; // Array of permission keys (strings) referencing AvailablePermission keys/IDs
}
