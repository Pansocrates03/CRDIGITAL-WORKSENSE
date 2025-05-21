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
  aiContext?: string;
  aiTechStack?: string;
  enableAiSuggestions?: boolean;
}