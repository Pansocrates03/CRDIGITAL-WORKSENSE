import { Timestamp } from "firebase-admin/firestore";

export interface Project {
    createdAt: Timestamp;
    description: string;
    id: string;
    ownerId: string;
    name: string;
    status: string;
    updatedAt: Timestamp;
}