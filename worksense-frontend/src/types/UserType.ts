// Import the User interface
export interface User {
  email: string;
  userId: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  nickName?: string;
  pfp?: string;
  platformRole?: string;
  // The following fields are no longer used in the database but kept for backward compatibility
  // gender?: number;
  // country?: string;
  // lang?: number;
  // timezone?: number;
}
