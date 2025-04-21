export interface TeamMember {
    id: number;
    name: string;
    role: string;
    avatar: string;
    email?: string;
    userId: string | number;
    projectId: string;
    roleId: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  }