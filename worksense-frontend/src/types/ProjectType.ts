import type Item from "./ItemType";
import type Role from "./RoleType";
import type Member from "./MembersType";

import { TeamMember } from "./TeamMemberType";

export interface Project {
    id: string;
    name: string;
    description: string;
    status: "Active" | "Inactive" | "Completed" | "On Hold";
    lastChange: string;
    members: Member[];
    items: Item[];
    roles: Role[];
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