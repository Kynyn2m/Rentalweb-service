import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaggingModel } from 'src/app/_helpers/response-model';

@Injectable({
  providedIn: 'root',
})
export class DistrictService {
  constructor(private http: HttpClient) {}

  // Fetch districts by province ID (this is used for public access)
  getByProvincePublic(provinceId: number): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/public/provinces/${provinceId}/districts`, {
      headers: {
        'Accept-Language': `km`,
        'api-version': `1`,
        'Content-Type': 'application/json',
      },
    });
  }


  // Fetch provinces (this works correctly as you've tested)
  getProvincesPublic(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/public/provinces`, {
      headers: {
        'Accept-Language': 'km',
        'Content-Type': 'application/json',
      },
    });
  }
}
