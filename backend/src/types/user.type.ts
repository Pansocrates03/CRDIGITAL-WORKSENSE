import { Timestamp } from "firebase-admin/firestore";

export interface User {
    id: string;
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    nickName: string;
    pfp: string;
    updatedAt: Timestamp
}