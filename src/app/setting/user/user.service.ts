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
    filter: FilterTemplate = new FilterTemplate()
  ): Observable<ResponseModel> {
    const url = `${environment.apiUrl}/users`;
    const params = new URLSearchParams();

    if (size > 0) {
      params.append('page', page.toString());
      params.append('size', size.toString());
    }
    if (searchText) {
      params.append('name', searchText);
    }
    if (filter.status) {
      params.append('status', filter.status);
    }
    if (filter.categories) {
      params.append('groupId', filter.categories.toString());
    }

    // Construct the full URL with parameters
    const fullUrl = `${url}?${params.toString()}`;
    return this.http.get<ResponseModel>(fullUrl);
  }

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
  assignRolesToUser(
    userId: number,
    roleIds: number[]
  ): Observable<ResponseModel> {
    const url = `${environment.apiUrl}/users/${userId}/roles`;
    return this.http.put<ResponseModel>(url, roleIds); // Sending the array of role IDs directly
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

  getAssignedRoles(id: number): Observable<ResponseModel> {
    const url = `${environment.apiUrl}/users/${id}/roles`; // Adjust URL as needed
    return this.http.get<ResponseModel>(url); // Use GET for fetching assigned roles
  }

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
