import Timestamp from "./FirebaseTimestamp";

// Import the User interface
export interface User {
  id: string;
  email: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  nickName?: string;
  pfp?: string;
  platformRole?: string;
  lastLogin: Timestamp;
}
