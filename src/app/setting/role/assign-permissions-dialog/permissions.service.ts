import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private permissionsUrl = `${environment.apiUrl}/permissions`;
  private rolesUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  // Fetch permissions from the API
  getPermissions(): Observable<any> {
    return this.http.get<any>(this.permissionsUrl);
  }

  // Assign permissions to a role
  assignPermissionsToRole(roleId: number, permissionIds: number[]): Observable<any> {
    const url = `${this.rolesUrl}/${roleId}/permissions`;
    return this.http.put(url, permissionIds); // Send only the array of permission IDs
  }
}
