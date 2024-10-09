import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaggingModel } from 'src/app/_helpers/response-model';

@Injectable({
  providedIn: 'root',
})
export class CommuneService {
  constructor(private http: HttpClient) {}

  getByDistrict(districtId: number): Observable<PaggingModel> {
    return this.http.get<PaggingModel>(
      `${environment.apiUrl}/districts/${districtId}/communes`,
      {
        headers: {
          'Accept-Language': `km`,
          'api-version': `2`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  getByDistrictC(districtId: number): Observable<PaggingModel> {
    return this.http.get<PaggingModel>(
      `${environment.apiUrl}/districts/${districtId}/communes`,
      {
        headers: {
          'Accept-Language': `km`,
          'api-version': `1`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  getByDistrictPublic(districtId: number): Observable<PaggingModel> {
    return this.http.get<PaggingModel>(
      `${environment.apiUrl}/public/districts/${districtId}/communes`,
      {
        headers: {
          'Accept-Language': `km`,
          'api-version': `1`,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
