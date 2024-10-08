import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Ensure you have the environment file properly set up

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/public/rooms`;

  constructor(private http: HttpClient) {}

  // Method to create a new room post
  createPost(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  // Method to fetch rooms with optional filters (fromPrice, toPrice, search, page, size)
  getRooms(params?: any): Observable<any> {
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
  likeRoom(roomId: number): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.put<any>(`${this.apiUrl}/like/${roomId}`, {}, { headers });
  }

  // Fetch image with headers
  getImage(imageUrl: string): Observable<Blob> {
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.get(imageUrl, { headers, responseType: 'blob' });
  }
  getRoomById(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`; // Assuming this.apiUrl is set to your base API URL
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.get<any>(url, { headers });
  }
  viewRoom(roomId: number): Observable<any> {
    const url = `${environment.apiUrl}/public/rooms/view/${roomId}`;
    return this.http.put(url, {}); // Sending an empty body since it's a view count
  }
}
