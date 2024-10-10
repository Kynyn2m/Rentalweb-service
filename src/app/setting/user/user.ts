import { ResetPassword } from 'src/app/authentication/change-password/reset-password';
import { ROLE_TYPE } from '../role/role';
import { CodeValue } from 'src/app/_helpers/code-value';

export class USER_TYPE {
  id!: number;
  fullName!: string;
  username!: string;
  email!: string;
  phoneNumber!: number;
  gender!: string;
  isView?: boolean;
  profilePic?: string | undefined;
  usernamer!: string;
  roleIds!: number[];
  permissionIds!: number[];

  status!: string;
}

export class RoleAssigned {
  groupId!: number;
  constructor(role: ROLE_TYPE) {
    this.groupId = role.id;
  }
}
export class FilterTemplate {
  status!: string;
  categories!: string;
}
export class Template {
  status!: CodeValue[];
  categories!: CodeValue[];
  genders!: CodeValue[];
}

export class RecommentFilter {
  category?: number;
  attenderCategory?: number;
}
