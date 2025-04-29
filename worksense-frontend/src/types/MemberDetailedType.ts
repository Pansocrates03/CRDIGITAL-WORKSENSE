export default interface MemberDetailed {
    userId: number,
    projectRoleId: string,
    joinedAt: {
      _seconds: number,
      _nanoseconds: number,
    },
    name: string,
    email: string,
  }
  