import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaggingModel } from 'src/app/_helpers/response-model';

@Injectable({
  providedIn: 'root',
})
export class VillageService {
  constructor(private http: HttpClient) { }

  getByCommune(communeId: number): Observable<PaggingModel> {
    return this.http.get<PaggingModel>(
      `${environment.apiUrl}/communes/${communeId}/villages`,
      {
        headers: {
          'Accept-Language': `km`,
          'api-version': `2`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  getAll(): Observable<PaggingModel> {
    return this.http.get<PaggingModel>(
      `${environment.apiUrl}/villages`,
      header
    );
  }
  getByCommunePublic(communeId: number): Observable<PaggingModel> {
    return this.http.get<PaggingModel>(
      `${environment.apiUrl}/public/communes/${communeId}/villages`,
      {
        headers: {
          'Accept-Language': `km`,
          'api-version': `1`,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  getAllPublic(): Observable<PaggingModel> {
    return this.http.get<PaggingModel>(
      `${environment.apiUrl}/public/villages`,
      header
    );
  }
}

export const header = {
  headers: {
    'Accept-Language': `km`,
    'api-version': `2`,
  },
};
