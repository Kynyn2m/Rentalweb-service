import { environment } from "src/environments/environment";

export class Token {
  fullname!: string;             // User's full name
  token!: string;                // Access token (JWT token)
  id!: number;                   // User ID
  roleList!: RoleList[];         // List of roles
  accessToken!: string;          // Access token for API calls
  refreshToken!: string;         // Refresh token for renewing the session
}

export interface RoleList {
  id: number;
  name: string;                  // Role name
  description: any;              // Role description
}

export class RoleListData {
  public static roleListData: RoleList[] = [];

  // Check if a user has a particular role
  public static exist(roleName: string): boolean {
    var found = false;
    if (this.roleListData != null) {
      for (var i = 0; i < this.roleListData.length; i++) {
        // Check if the role exists or if it's the admin role from the environment
        if (this.roleListData[i].name === roleName || this.roleListData[i].name === environment.roleAdmin) {
          found = true;
          break;
        }
      }
    }
    return found;
  }
}
