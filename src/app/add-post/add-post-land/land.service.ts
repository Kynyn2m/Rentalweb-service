import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Ensure you have the environment file properly set up

@Injectable({
  providedIn: 'root',
})
export class LandService {
  private apiUrl = `${environment.apiUrl}/public/lands`;

  constructor(private http: HttpClient) {}

  // Method to create a new land post
  createPost(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  // Method to fetch land with optional filters (fromPrice, toPrice, search, page, size)
  getLand(params?: any): Observable<any> {
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
      if (params.page !== undefined) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.size !== undefined) {
        httpParams = httpParams.set('size', params.size.toString()); // Use 'size' instead of 'itemsPerPage'
      }
    }

    return this.http.get<any>(this.apiUrl, { headers, params: httpParams });
  }
  likeLand(landId: number): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.put<any>(`${this.apiUrl}/like/${landId}`, {}, { headers });
  }

  // Fetch image with headers

  getImage(imageUrl: string): Observable<Blob> {
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.get(imageUrl, { headers, responseType: 'blob' });
  }
  // getHouseById(id: string): Observable<any> {
  //   const url = `${this.apiUrl}/${id}`; // Assuming this.apiUrl is set to your base API URL
  //   const headers = new HttpHeaders().set('api-version', '1');
  //   return this.http.get<any>(url, { headers });
  // }
  viewLand(landId: number): Observable<any> {
    const url = `${environment.apiUrl}/public/lands/view/${landId}`;
    return this.http.put(url, {}); // Sending an empty body since it's a view count
  }
}
