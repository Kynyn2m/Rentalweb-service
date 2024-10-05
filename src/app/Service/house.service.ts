import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Ensure you have the environment file properly set up

@Injectable({
  providedIn: 'root'
})
export class HouseService {

  private apiUrl = `${environment.apiUrl}/public/houses`;

  constructor(private http: HttpClient) { }

  // Method to create a new house post
  createPost(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  // Method to fetch houses with optional filters (fromPrice, toPrice, search)
  getHouses(params?: any): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');

    // Build query parameters if they exist
    let httpParams = new HttpParams();
    if (params) {
      if (params.fromPrice) {
        httpParams = httpParams.set('fromPrice', params.fromPrice.toString());
      }
      if (params.toPrice) {
        httpParams = httpParams.set('toPrice', params.toPrice.toString());
      }
      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
      if (params.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.itemsPerPage) {
        httpParams = httpParams.set('itemsPerPage', params.itemsPerPage.toString());
      }
    }

    return this.http.get<any>(this.apiUrl, { headers, params: httpParams });
  }

  // Fetch image with headers
  getImage(imageUrl: string): Observable<Blob> {
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.get(imageUrl, { headers, responseType: 'blob' });
  }
}
