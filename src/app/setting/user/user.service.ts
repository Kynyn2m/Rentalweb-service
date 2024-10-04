import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ResponseModel } from 'src/app/_helpers/response-model';
import { FilterTemplate, USER_TYPE } from './user';
import { environment } from 'src/environments/environment';
import { ChangePassword } from 'src/app/authentication/change-password/change-password';
import { Signature } from 'src/app/authentication/signature';
import { RoleAssigned } from '../role/role';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}
  uri = '/users/v1';

  gets(
    page: number,
    size: number,
    searchText: string = '',
    filter: FilterTemplate
  ): Observable<ResponseModel> {
    var url = `${environment.apiUrl}/users`;
    if (size > 0) url = url + `?page=${page}&size=${size}&name=${searchText}`;
    if (filter.status) url = url + `&status=${filter.status}`;
    if (filter.categories) url = url + `&groupId=${filter.categories}`;
    return this.http.get<ResponseModel>(url);
  }

  // createUser(user: USER_TYPE): Observable<ResponseModel> {
  //   return this.http.post<ResponseModel>(
  //     `${environment.apiUrl}${this.uri}/register`,
  //     user
  //   );
  // }

  // put(user: USER_TYPE): Observable<ResponseModel> {
  //   return this.http.put<ResponseModel>(
  //     `${environment.apiUrl}${this.uri}/users`,
  //     user
  //   );
  // }

  updateUser(user: USER_TYPE, id: number): Observable<ResponseModel> {
    return this.http.put<ResponseModel>(
      `${environment.apiUrl}/users/${id}`,
      user,
      {
        headers: {
          key: 'Api-Version',
          value: '1',
        },
      }
    );
  }

  deleteUser(id: number) {
    return this.http.delete(`${environment.apiUrl}/users/${id}`);
  }

  postForgetPasswordRequest(mail: string): Observable<Signature> {
    return this.http.post<Signature>(
      `${environment.apiUrl}/users/v1/forgot-password`,
      {
        email: mail,
      }
    );
  }

  postForgetPasswordVerify(
    signature: string,
    password: string,
    confirmPassword: string
  ) {
    return this.http.post(`${environment.apiUrl}/users/v1/reset-password`, {
      confirmPassword: confirmPassword,
      password: password,
      signature: signature,
    });
  }

  changePassword(changePassword: ChangePassword): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/users/v1/change-password`,
      changePassword
    );
  }

  // getAssignedRoles(
  //   id: number,
  //   roles: { roleId: number }[]
  // ): Observable<ResponseModel> {
  //   const url = `${environment.apiUrl}/users/${id}/roles`; // Correctly construct the URL
  //   return this.http.post<ResponseModel>(url, roles);
  // }
  getAssignedRoles(id: number): Observable<ResponseModel> {
    const url = `${environment.apiUrl}/users/${id}/roles`; // Adjust URL as needed
    return this.http.get<ResponseModel>(url); // Use GET for fetching assigned roles
  }

  // getUserRoles(id: number): Observable<ResponseModel> {
  //   return this.http.get<ResponseModel>(' ${environment.apiUrl}/users/${id}');
  // }
  getUserRoles(
    id: number,
    roles: { roleId: number }[]
  ): Observable<ResponseModel> {
    const url = `${environment.apiUrl}/users/${id}/roles`; // Adjust URL for assigning roles
    return this.http.post<ResponseModel>(url, roles);
  }

  postUserRole(
    userId: number,
    roleAssigned: RoleAssigned[]
  ): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(
      `${environment.apiUrl}/users/v1/assign-user-group?userId=${userId}`,
      roleAssigned
    );
  }
}
