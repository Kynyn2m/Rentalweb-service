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
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }
  uri = "/users/v1";

  gets(page: number, size: number, searchText: string = '', filter: FilterTemplate): Observable<ResponseModel> {
    var url = `${environment.apiUrl}${this.uri}/list`;
    if (size > 0) url = url + `?page=${page}&size=${size}&name=${searchText}`;
    if (filter.status) url = url + `&status=${filter.status}`
    if (filter.categories) url = url + `&groupId=${filter.categories}`
    return this.http.get<ResponseModel>(url);
  }

  post(user: USER_TYPE): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${environment.apiUrl}${this.uri}/register`, user);
  }

  put(user: USER_TYPE): Observable<ResponseModel> {
    return this.http.put<ResponseModel>(`${environment.apiUrl}${this.uri}/update-info`, user);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}${this.uri}/delete/${id}`);
  }

  postForgetPasswordRequest(mail: string): Observable<Signature> {
    return this.http.post<Signature>(`${environment.apiUrl}/users/v1/forgot-password`, {
      email: mail
    });
  }

  postForgetPasswordVerify(signature: string, password: string, confirmPassword: string) {
    return this.http.post(`${environment.apiUrl}/users/v1/reset-password`,
      {
        confirmPassword: confirmPassword,
        password: password,
        signature: signature
      });
  }


  changePassword(changePassword: ChangePassword): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${environment.apiUrl}/users/v1/change-password`, changePassword);
  }
  getAssignedRole(userId: number): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${environment.apiUrl}/users/v1/get-user-group/${userId}`);
  }
  postUserRole(userId: number, roleAssigned: RoleAssigned[]): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${environment.apiUrl}/users/v1/assign-user-group?userId=${userId}`, roleAssigned);
  }

}
