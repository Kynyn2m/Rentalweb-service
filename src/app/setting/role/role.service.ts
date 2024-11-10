import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseModel, PaggingModel } from 'src/app/_helpers/response-model';
import { ROLE_TYPE } from './role';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private rolesUrl = `${environment.apiUrl}/roles`;
  private assignRoleUrl = `${environment.apiUrl}/users`;
  constructor(private http: HttpClient) {}

  getRoles(): Observable<any> {
    return this.http.get<any>(`${this.rolesUrl}`);
  }

  // Assign role to a user (PUT request)
  assignRoleToUser(userId: number, roleId: number): Observable<any> {
    const url = `${this.assignRoleUrl}/${userId}/roles`;
    return this.http.put<any>(url, { roles: [roleId] }); // Assuming the payload needs to be { roles: [roleId] }
  }

  // Get paginated roles data
  gets(
    page: number,
    size: number,
    search: string,
    filter: any
  ): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${environment.apiUrl}/roles`, {
      params: {
        page: page.toString(),
        size: size.toString(),
        search: search,
        filter: JSON.stringify(filter), // Assuming filter is sent as a JSON string
      },
    });
  }
  createRole(role: ROLE_TYPE): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/roles`, {
      name: role.name,
      description: role.description,
    });
  }

  updateRole(role: ROLE_TYPE): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/roles/${role.id}`, {
      name: role.name,
      description: role.description,
    });
  }

  // Method to delete role
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/roles/${id}`);
  }
}
