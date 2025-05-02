export default interface MemberDetailed {
    userId: number,
    projectRoleId: string,
    joinedAt: {
      _seconds: number,
      _nanoseconds: number,
    },
    name: string,
    profilePicture: string,
    email: string,
    lastLogin: string,
    nickname?: string,
}
  