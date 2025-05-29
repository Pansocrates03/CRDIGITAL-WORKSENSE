export interface Ticket {
    id: string;
    assignedTo: string;
    description: string;
    name: string;
    parentId: string;
    priority: string;
    status: string;
    tasks: {isFinished:boolean, name:string}[]
}