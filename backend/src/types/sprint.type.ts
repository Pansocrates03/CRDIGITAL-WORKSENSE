import { Timestamp } from "firebase-admin/firestore";

export interface Sprint {
    columns: string[]
    createdAt: Timestamp;
    endDate: Timestamp;
    goal: string;
    items: string[];
    name: string;
    startDate: Timestamp;
    status: "planned"|"active"|"completed";
    updatedAt: Timestamp
}