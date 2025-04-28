import type Permissions from "./PermissionsType";
import Role from "./RoleType";

export default interface Member {
    memberID: string,
    role: Role
}