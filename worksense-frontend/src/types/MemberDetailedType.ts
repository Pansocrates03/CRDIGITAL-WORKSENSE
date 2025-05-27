import { User } from "./UserType"

export default interface MemberDetailed {
    joinedAt: {
      _seconds: number,
      _nanoseconds: number,
    },
    projectRoleId: string
    userId: string
    updatedAt: {
      _seconds: number,
      _nanoseconds: number,
    },
    user: User
}
  