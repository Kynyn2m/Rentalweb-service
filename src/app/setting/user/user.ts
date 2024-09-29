import { ResetPassword } from 'src/app/authentication/change-password/reset-password';
import { ROLE_TYPE } from '../role/role';
import { CodeValue } from 'src/app/_helpers/code-value';

export class USER_TYPE {
  changePassword(resetPassword: ResetPassword) {
    throw new Error('Method not implemented.');
  }
  updateBy!: string;
  updateAt!: string;
  id!: number;
  uuid!: string;
  username!: string;
  email!: string;
  fullName!: string;
  gender!: string;
  isView?: boolean;
  profilePic?: string | undefined;

  firstName!: string;
  familyName!: string;
  status!: string;
  enabled!: string;
  createdAt!: string;
  updatedAt!: string;
  password!: string;
  // creator!: Creator;
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
