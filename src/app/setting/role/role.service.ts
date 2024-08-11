import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { ResponseModel } from 'src/app/_helpers/response-model';
import { FilterTemplate, ROLE_TYPE } from './role';

@Injectable({
  providedIn: 'root',

})
export class RoleService {

  constructor(private http: HttpClient) { }
  uri = "/group/v1";

  getAll(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${environment.apiUrl}/group/v1/list`);
  }

  gets(page: number, size: number, searchText: string = '', filter: FilterTemplate): Observable<ResponseModel>{
    var url = `${environment.apiUrl}${this.uri}/list`;
    if (size > 0) url = url + `?page=${page}&size=${size}&name=${searchText}`;
    if (filter.status) url = url + `&status=${filter.status}`
    if (filter.categories) url = url + `&groupId=${filter.categories}`
    return this.http.get<ResponseModel>(url);
  }

  get(id: string): Observable<ROLE_TYPE> {
    return this.http.get<ROLE_TYPE>(`${environment.apiUrl}/roles/${id}`);
  }

  put(id: number, role: ROLE_TYPE): Observable<ResponseModel> {
    return this.http.put<ResponseModel>(`${environment.apiUrl}/group/v1/update/${id}`, role);
  }

  post(role: ROLE_TYPE): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${environment.apiUrl}/group/v1/create`, role);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/group/v1/delete/${id}`);
  }
}