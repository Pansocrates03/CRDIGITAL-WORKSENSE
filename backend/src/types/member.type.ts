import { Timestamp } from "firebase-admin/firestore";
import { User } from "./user.type.js";

export interface rawMember {
    joinedAt: Timestamp
    projectRoleId: string
    userId: string
    updatedAt: Timestamp
}

export interface Member {
    joinedAt: Timestamp
    projectRoleId: string
    userId: string
    updatedAt: Timestamp
    user: User
}