import { User } from "./UserType";

export default interface Member {
    joinedAt: {
    _seconds: number;
    _nanoseconds: number;
    };
    projectRoleId: string;
    updatedAt: {
    _seconds: number;
    _nanoseconds: number;
    };
    userId: string;
    user: User
}

export class AddMemberInput {
    userId!: string;
    projectRoleId!: string;
}