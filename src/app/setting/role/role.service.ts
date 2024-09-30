import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseModel, PaggingModel } from 'src/app/_helpers/response-model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private http: HttpClient) {}

  // Get paginated roles data
  gets(page: number, size: number, search: string, filter: any): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${environment.apiUrl}/roles`, {
      params: {
        page: page.toString(),
        size: size.toString(),
        search: search,
        filter: JSON.stringify(filter), // Assuming filter is sent as a JSON string
      },
    });
  }

  // Delete role by ID
  delete(roleId: number): Observable<ResponseModel> {
    return this.http.delete<ResponseModel>(`${environment.apiUrl}/roles/${roleId}`);
  }
}
