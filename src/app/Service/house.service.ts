import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Ensure you have the environment file properly set up
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class HouseService {

  private apiUrl = `${environment.apiUrl}/public/houses`;

  constructor(private http: HttpClient,private sanitizer: DomSanitizer) { }

  // Method to create a new house post
  createPost(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  // Method to fetch houses with optional filters (fromPrice, toPrice, search, page, size)
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
      if (params.page !== undefined) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.size !== undefined) {
        httpParams = httpParams.set('size', params.size.toString()); // Use 'size' instead of 'itemsPerPage'
      }
    }

    return this.http.get<any>(this.apiUrl, { headers, params: httpParams });
  }
  likeHouse(houseId: number): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.put<any>(`${this.apiUrl}/like/${houseId}`, {}, { headers });
  }

  // Fetch image with headers
  getImage(imageUrl: string): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.get(imageUrl, { headers, responseType: 'blob' });
  }

  // Method to safely convert Blob to a URL and sanitize it
  createImageUrl(imageBlob: Blob): any {
    const objectURL = URL.createObjectURL(imageBlob);
    return this.sanitizer.bypassSecurityTrustUrl(objectURL); // Safe URL for Angular templates
  }
  getHouseById(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`; // Assuming this.apiUrl is set to your base API URL
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.get<any>(url, { headers });
  }
  viewHouse(houseId: number): Observable<any> {
    const url = `${environment.apiUrl}/public/houses/view/${houseId}`;
    return this.http.put(url, {}); // Sending an empty body since it's a view count
  }

  updateHouse(id: number, formData: FormData): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.put(`${this.apiUrl}/${id}`, formData, { headers });
  }
  deleteHouse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }


}
