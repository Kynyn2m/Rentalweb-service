import { Permission } from "./permission";

export class PermissionGroup {
  category!: string;
  roleList!: Permission[];
  completed:boolean=false;
}
