import { RoleList } from "src/app/authentication/token";

export class RolePermission {
    roleId!:number;
    constructor(roleList:RoleList){
        this.roleId=roleList.id;
    }
}