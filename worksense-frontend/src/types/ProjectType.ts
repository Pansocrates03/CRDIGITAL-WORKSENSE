export default interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  ownerId: number;
  context: {};
  createdAt: {};
  members?: Array<{ userId: number; role: string; projectRoleId?: string }>;
  status?: string;
  startDate?: string;
  endDate?: string;
  visibility?: string;
  
  // AI Settings
  aiContext?: string;
  aiTechStack?: string;
  enableAiSuggestions?: boolean;

  // Scrum Settings
  sprintDuration?: number;
  workingDays?: string[];
  storyPointScale?: "fibonacci" | "linear" | "tshirt";

  // Metrics Settings
  enableBurndownChart?: boolean;
  enableVelocityTracking?: boolean;
  enableWorkloadHeatmaps?: boolean;

  // Customization Settings
  workflowStages?: string[];
  tags?: string[];
}