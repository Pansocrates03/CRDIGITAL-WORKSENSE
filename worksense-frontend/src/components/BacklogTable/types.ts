// src/types/backlog.ts (or wherever you store your type definitions)

export interface User {
  userId: number;
  name?: string;
  nickname?: string;
  profilePicture?: string;
  id?: number; // for compatibility with different API responses
}

export interface Epic {
  id: string;
  name: string;
}

export interface User {
  userId: number;
  name?: string;
}
