export interface Ticket {
    id: string;
    assignedTo: string;
    description: string;
    name: string;
    priority: string;
    status: string;
    subtasks: string[]
}