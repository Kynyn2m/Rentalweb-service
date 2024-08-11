import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../../_helpers/response-model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) { }

  private baseUri = environment.apiUrl;

  getDashboardCounts(): Observable<ResponseModel> {
    const url = `${environment.apiUrl}/dashboard/v1/count`;
    return this.http.get<ResponseModel>(url).pipe(
    );
  }


}
