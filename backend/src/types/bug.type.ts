import { Timestamp } from "firebase-admin/firestore";

export interface Bug {
    assignedTo: number;
    createdAt: Timestamp;
    description: string;
    name: string;
    priority: string;
    reportedBy: number;
    severity: string;
    status: string;
    updatedAt: Timestamp;
}