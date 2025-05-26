import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export interface Epic {
    createdAt: Timestamp;
    description: string;
    name: string;
    priority: string;
    startDate: Timestamp;
    status: string,
    updatedAt: Timestamp;
}