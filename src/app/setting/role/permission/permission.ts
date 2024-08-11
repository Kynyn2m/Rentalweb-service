export class Permission {
    id!: number
    name!: string
    description!: string
    completed:boolean = false;
}

export class PermissionData {
    public static permissions: Permission[] = [];
    public static exist(permission_name: string): boolean {
        var found = false;
        for (var i = 0; i < this.permissions.length; i++) {
            if (this.permissions[i].name == permission_name) {
                found = true;
                break;
            }
        }
        return found;
    }
}
