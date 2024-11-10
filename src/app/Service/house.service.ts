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
  providedIn: 'root'
})
export class HouseService {

  private apiUrl = `${environment.apiUrl}/public/houses`;
  private apilike = `${environment.apiUrl}`;

  constructor(private http: HttpClient,private sanitizer: DomSanitizer) { }

  // Method to create a new house post
  createPost(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }
  updateHousepf(houseId: number, houseData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${houseId}`, houseData);
  }
  getComments(houseId: number): Observable<{ code: number; message: string; result: { result: UserComment[] } }> {
    const url = `${this.apiUrl}/${houseId}/comments`;
    return this.http.get<{ code: number; message: string; result: { result: UserComment[] } }>(url);
  }
  replyToComment(commentId: number, description: string): Observable<any> {
    const url = `${environment.apiUrl}/comments/${commentId}`; // Directly use environment.baseUrl
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { description };
    return this.http.post(url, body, { headers });
  }

  postComment(houseId: number, description: string, type: string): Observable<any> {
    const url = `${this.apilike}/comments`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {
      houseId: houseId.toString(),
      type: type,
      description: description
    };
    return this.http.post(url, body, { headers });
  }

  deleteComment(commentId: number): Observable<any> {
    const url = `${this.apilike}/comments/${commentId}`;
    return this.http.delete(url);
  }




  getHouses(params?: any): Observable<any> {
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


  likeHouse(postId: number, postType: string, options: any = {}): Observable<any> {
    const headers = new HttpHeaders().set('api-version', '1');
    const url = `${this.apilike}/public/like?postId=${postId}&postType=${postType}`;
    return this.http.post<any>(url, {}, { headers, ...options });
}
toggleFavorite(postId: number, postType: string): Observable<any> {
  const headers = new HttpHeaders().set('api-version', '1');
  const url = `${this.apilike}/public/favorites?postId=${postId}&postType=${postType}`;
  return this.http.post<any>(url, {}, { headers });
}

favoriteHouse(postId: number, postType: string): Observable<any> {
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
  getHouseById(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
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
