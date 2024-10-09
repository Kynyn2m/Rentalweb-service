import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getProvinceById(provinceId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/public/provinces/${provinceId}`);
  }

  getDistrictById(districtId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/public/districts/${districtId}`);
  }

  getCommuneById(communeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/public/communes/${communeId}`);
  }

  getVillageById(villageId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/public/villages/${villageId}`);
  }
}
