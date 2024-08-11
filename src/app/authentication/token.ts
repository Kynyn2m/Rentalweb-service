import { environment } from "src/environments/environment"

export class Token {
  fullname!: string
  token!: string
  id!: number
  roleList!: RoleList[]
}

export interface RoleList {
  id: number
  name: string
  description: any
}

export class RoleListData {
  public static roleListData: RoleList[] = [];
  public static exist(roleName: string): boolean {
    var found = false;
    if (this.roleListData != null) {
      for (var i = 0; i < this.roleListData!.length; i++) {
        if (this.roleListData![i].name == roleName || this.roleListData![i].name == environment.roleAdmin) {
          found = true;
          break;
        }
      }
    }
    return found;
  }
}
