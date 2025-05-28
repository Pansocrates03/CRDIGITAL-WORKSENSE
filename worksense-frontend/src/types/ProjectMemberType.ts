// src/types/ProjectMemberType.ts

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  pfp: string;
  platformRole: string;
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectRoleId: string;
  joinedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  user: UserInfo;
}

