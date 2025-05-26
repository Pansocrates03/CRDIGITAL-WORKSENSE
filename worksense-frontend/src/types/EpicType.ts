
// Import Timestamp type if using Firestore, or define it if custom
import { Timestamp } from 'firebase/firestore';

export interface Epic {
    id: string;
    createdAt: Timestamp;
    description: string;
    name: string;
    priority: string;
    startDate: Timestamp;
    status: string,
    updatedAt: Timestamp;
}