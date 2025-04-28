import type Permissions from "./PermissionsType";

export default interface Role {
    roleID: string;
    name: string,
    permissions: Permissions
}