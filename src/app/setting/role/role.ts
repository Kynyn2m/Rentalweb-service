import { BaseResponse } from "src/app/_helpers/utility"

export class ROLE_TYPE {
  id!: number;
  name!: string;
  description !: string;
  updateAt!: string;
  updateBy!: string
}

export class RoleAssigned {
  groupId!: number
  constructor(role: ROLE_TYPE) {
    this.groupId = role.id;
  }
}
export class FilterTemplate {
  status!: string
  categories!: string
}



// export class ApiResponse {
//     responseCode: string;
//     responseMessage: string;
//     data: CategoryRole[];

//     constructor(responseCode: string, responseMessage: string, data: CategoryRole[]) {
//         this.responseCode = responseCode;
//         this.responseMessage = responseMessage;
//         this.data = data;
//     }
// }
