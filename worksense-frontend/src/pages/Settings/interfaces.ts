export interface UserCreationForm {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  platformRole: string;
}

export interface CreatedUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  userId?: number;
  platformRole: string;
}

export interface UserListItem {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  platformRole: string;
  pfp?: string;
  nickName?: string;
}

export type TabType = "account" | "userManagement";
