export default interface ProjectDetails {
    updatedAt: any;
    id: string;
    name: string;
    description: string;
    ownerId: number;
    context: {};
    createdAt: {};
    members?: Array<{ userId: number; role: string; projectRoleId?: string }>;
    status?: string;
    startDate?: string;
    endDate?: string;
    visibility?: string;
}