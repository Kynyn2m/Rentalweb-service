import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseModel } from 'src/app/_helpers/response-model';

@Injectable({
  providedIn: 'root'
})
export class PermissionGroupService {
  
  constructor(private http: HttpClient) {
  }

  getAll(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${environment.apiUrl}/role/v1/list`);
  }
}
