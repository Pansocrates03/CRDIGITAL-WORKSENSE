// Type for the nested sub-items and comments (even if not displayed initially)
interface SubItem {
  id: string;
  [key: string]: any; // Or define more specific fields if known
}

interface Comment {
  id: string;
  [key: string]: any; // Or define more specific fields if known
}

// Define the structure of a single item as returned by your /items endpoint
export interface BacklogItemType {
  id: string; // The item's own ID
  projectID: string; // ID of the parent project
  parentId: string | null; // ID of the parent item (null for top-level)
  type: "epic" | "story" | "task" | "bug"; // Type of the backlog item
  name: string;
  description: string;
  tag?: string; // Optional fields based on your backend logic
  status: string; // e.g., 'backlog', 'todo', 'inprogress', 'done' - adjust as needed
  priority: string; // e.g., 'low', 'medium', 'high' - adjust as needed
  size?: number;
  author?: string;
  asignee?: string[]; // Array of strings
  acceptanceCriteria?: string[]; // Array of strings
  createdAt: string | { _seconds: number; _nanoseconds: number }; // Firestore Timestamp might be serialized differently by Express (ISO string or object)
  updatedAt: string | { _seconds: number; _nanoseconds: number };
  items?: SubItem[]; // Nested items from the subcollection (optional based on endpoint)
  comments?: Comment[]; // Comments from the subcollection (optional based on endpoint)
  children?: BacklogItemType[];
  hasChildren?: boolean;
}

// Helper function to safely convert potential Firestore Timestamp serialization
export const parseTimestamp = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  // Handle Firebase Admin SDK Timestamp object serialization ({ _seconds, _nanoseconds })
  if (
    timestamp &&
    typeof timestamp === "object" &&
    timestamp._seconds !== undefined
  ) {
    return new Date(
      timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000
    );
  }
  // Handle ISO string serialization
  if (typeof timestamp === "string") {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date; // Check if parsing was successful
  }
  // Handle Firestore Client SDK Timestamp objects (if they somehow pass through)
  if (timestamp && typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  // Handle number (milliseconds since epoch)
  if (typeof timestamp === "number") {
    return new Date(timestamp);
  }
  console.warn("Unrecognized timestamp format:", timestamp);
  return null; // Return null if format is unrecognized
};

// Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  nickName: string | null;
}

export interface ProjectMember {
  userId: number;
  roleId: string;
}

export interface FormErrors {
  projectName?: string;
  description?: string;
  members?: string;
}
export interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    projectName: string,
    description: string,
    members: ProjectMember[],
    shouldPopulateBacklog: boolean
  ) => Promise<string>; // Return project ID
  /** Initial project name (for editing mode) */
  initialProjectName?: string;
  /** Initial project description (for editing mode) */
  initialDescription?: string;
  /** Modal title. Defaults to "New Project" */
  title?: string;
  /** Submit button text. Defaults to "Start" */
  submitButtonText?: string;
  /** Current user ID to exclude from the dropdown */
  currentUserId: number;
}
