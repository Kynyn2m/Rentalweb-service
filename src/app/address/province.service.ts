import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Province } from './province';
import { PaggingModel, ResponseModel } from 'src/app/_helpers/response-model';

@Injectable({
  providedIn: 'root',
})
export class ProvinceService {
  private provinceSubjects: BehaviorSubject<Province[]>;
  public provinces: Observable<Province[]>;

  constructor(private http: HttpClient) {
    this.provinceSubjects = new BehaviorSubject<Province[]>([]);
    this.provinces = this.provinceSubjects.asObservable();
  }

  getAll(): Observable<PaggingModel> {
    return this.http.get<PaggingModel>(`${environment.apiUrl}/provinces`, {
      headers: {
        'Accept-Language': `km`,
        'api-version': `2`,
        'Content-Type': 'application/json',
      },
    });
  }
  getAllPublic(): Observable<PaggingModel> {
    return this.http.get<PaggingModel>(
      `${environment.apiUrl}/public/provinces`,
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
