import { TeamMember } from "./TeamMemberType";

export interface Project {
    id: string;
    name: string;
    description: string;
    status: "Active" | "Inactive" | "Completed" | "On Hold";
    lastChange: string;
    members: Array<{
      id: string;
      name?: string;
      avatar?: string;
    }>;
    items: Array<{
      id: string;
      status: string;
    }>;
  }

  export interface ProjectViewData {
    id: string;
    name: string;
    description: string;
    currentSprint: {
      number: number;
      startDate: string;
      endDate: string;
    };
    team: TeamMember[];
  }