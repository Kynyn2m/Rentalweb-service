import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Permission } from './permission';
import { RolePermission } from './role-permission';
import { ResponseModel } from 'src/app/_helpers/response-model';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

  constructor(private http: HttpClient) {
  }

  getByUser(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${environment.apiUrl}/Permissions`);
  }

  getAllPermission(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${environment.apiUrl}/role/v1/list`);
  }

  getRolePermissions(roleId:number):Observable<ResponseModel>{
    return this.http.get<ResponseModel>(`${environment.apiUrl}/group/v1/get-group-role/${roleId}`);
  }

  putRolePermission(roleId: number, rolePermissions: RolePermission[]): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${environment.apiUrl}/role/v1/assign-role-group?groupId=${roleId}`, rolePermissions);
  }

  getMyPermission(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${environment.apiUrl}/Permissions/my-permissions`);
  }

  getCurrentUserRole(): Observable<ResponseModel>{
    return this.http.get<ResponseModel>(`${environment.apiUrl}/role/v1/get-current-role`);
  }

}
