import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Ensure you have the environment file properly set up
interface UserComment {
  id: number;
  userId: number;
  name: string;
  description: string;
  imagePath: string;

  totalReply: number;
}
@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private apiUrl = `${environment.apiUrl}/public/rooms`;
  private apilike = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Method to create a new room post
  createPost(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  // Method to fetch rooms with optional filters (fromPrice, toPrice, search, page, size)
  getRooms(params?: any): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
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
        httpParams = httpParams.set('size', params.size.toString());
      }

      // New query params for address fields
      if (params.provinceId) {
        httpParams = httpParams.set('provinceId', params.provinceId.toString());
      }
      if (params.districtId) {
        httpParams = httpParams.set('districtId', params.districtId.toString());
      }
      if (params.communeId) {
        httpParams = httpParams.set('communeId', params.communeId.toString());
      }
      if (params.villageId) {
        httpParams = httpParams.set('villageId', params.villageId.toString());
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

  updateRoom(id: number, formData: FormData): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.put(`${this.apiUrl}/${id}`, formData, { headers });
  }
  // updateRoom(roomId: number, roomData: any): Observable<any> {
  //   return this.http.put<any>(`${this.apiUrl}/${roomId}`, roomData);
  // }
  deleteRoom(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  getComments(roomId: number): Observable<{
    code: number;
    message: string;
    result: { result: UserComment[] };
  }> {
    const url = `${this.apiUrl}/${roomId}/comments`;
    return this.http.get<{
      code: number;
      message: string;
      result: { result: UserComment[] };
    }>(url);
  }
  replyToComment(commentId: number, description: string): Observable<any> {
    const url = `${environment.apiUrl}/comments/${commentId}`; // Directly use environment.baseUrl
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { description };
    return this.http.post(url, body, { headers });
  }
  postComment(
    roomId: number,
    description: string,
    type: string
  ): Observable<any> {
    const url = `${this.apilike}/comments`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      roomId: roomId.toString(),
      type: type,
      description: description,
    };
    return this.http.post(url, body, { headers });
  }

  deleteComment(commentId: number): Observable<any> {
    const url = `${this.apilike}/comments/${commentId}`;
    return this.http.delete(url);
  }
}
