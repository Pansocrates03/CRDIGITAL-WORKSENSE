import { Timestamp } from "firebase-admin/firestore";

export interface Story {
    id: string;
    assignedTo: number;
    createdAt: Timestamp;
    description: string;
    name: string;
    priority: string;
    status: string;
    storyPoints: number;
    updatedAt: Timestamp;
    parentId: string;
    sprintId: string;
}