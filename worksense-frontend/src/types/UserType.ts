// Import the User interface
export interface User {
  email: string;
  userId: number;
  firstName?: string;
  lastName?: string;
  gender?: string;
  fullName?: string;
}

// Extended user profile with additional fields
export interface UserProfile extends User {
  nickName?: string;
  country?: string;
  language?: string;
  timeZone?: string;
  avatar?: string;
}