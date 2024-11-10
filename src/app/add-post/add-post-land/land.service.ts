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
export class LandService {
  private apiUrl = `${environment.apiUrl}/public/lands`;
  private apilike = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Method to create a new land post
  createPost(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  // Method to fetch land with optional filters (fromPrice, toPrice, search, page, size)
  getLand(params?: any): Observable<any> {
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
  toggleFavorite(postId: number, postType: string): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    const url = `${this.apilike}/public/favorites?postId=${postId}&postType=${postType}`;
    return this.http.post<any>(url, {}, { headers });
  }

  // Fetch image with headers

  getLandById(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`; // Assuming this.apiUrl is set to your base API URL
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.get<any>(url, { headers });
  }

  likeLand(
    postId: number,
    postType: string,
    options: any = {}
  ): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    const url = `${this.apilike}/public/like?postId=${postId}&postType=${postType}`;
    return this.http.post<any>(url, {}, { headers, ...options });
  }
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

  updateLand(id: number, formData: FormData): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.put(`${this.apiUrl}/${id}`, formData, { headers });
  }
  deleteLand(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  getComments(landId: number): Observable<{
    code: number;
    message: string;
    result: { result: UserComment[] };
  }> {
    const url = `${this.apiUrl}/${landId}/comments`;
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
    landId: number,
    description: string,
    type: string
  ): Observable<any> {
    const url = `${this.apilike}/comments`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      landId: landId.toString(),
      type: type,
      description: description,
    };
    return this.http.post(url, body, { headers });
  }

  deleteComment(commentId: number): Observable<any> {
    const url = `${this.apilike}/comments/${commentId}`;
    return this.http.delete(url);
  }
  favoriteLand(postId: number, postType: string): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    const url = `${this.apilike}/public/favorites?postId=${postId}&postType=${postType}`;
    return this.http.post(url, {}, { headers, responseType: 'text' });
  }
}
