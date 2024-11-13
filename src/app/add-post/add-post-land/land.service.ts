import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Ensure you have the environment file properly set up
import { DomSanitizer } from '@angular/platform-browser';
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

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  // Method to create a new house post
  createPost(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }
  updateLand(landId: number, landData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${landId}`, landData);
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
  updateComment(commentId: number, updatedComment: any): Observable<any> {
    return this.http.put(
      `${this.apilike}/comments/${commentId}`,
      updatedComment
    );
  }

  deleteComment(commentId: number): Observable<any> {
    const url = `${this.apilike}/comments/${commentId}`;
    return this.http.delete(url);
  }

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

  likeLand(
    postId: number,
    postType: string,
    options: any = {}
  ): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    const url = `${this.apilike}/public/like?postId=${postId}&postType=${postType}`;
    return this.http.post<any>(url, {}, { headers, ...options });
  }
  toggleFavorite(postId: number, postType: string): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    const url = `${this.apilike}/public/favorites?postId=${postId}&postType=${postType}`;
    return this.http.post<any>(url, {}, { headers });
  }

  favoriteLand(postId: number, postType: string): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    const url = `${this.apilike}/public/favorites?postId=${postId}&postType=${postType}`;
    return this.http.post(url, {}, { headers, responseType: 'text' });
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
  getLandById(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.get<any>(url, { headers });
  }
  viewLand(landId: number): Observable<any> {
    const url = `${environment.apiUrl}/public/lands/view/${landId}`;
    return this.http.put(url, {}); // Sending an empty body since it's a view count
  }

  updateHouse(id: number, formData: FormData): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    return this.http.put(`${this.apiUrl}/${id}`, formData, { headers });
  }
  deleteLand(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
