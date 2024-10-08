import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;
  private userHousesUrl = `${environment.apiUrl}/public/houses/me`;
  private userlandUrl = `${environment.apiUrl}/public/lands/me`;
  private userroomUrl = `${environment.apiUrl}/public/rooms/me`;

  constructor(private http: HttpClient) { }

  getProfile(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  updateProfile(profileData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'enctype': 'multipart/form-data'
    });

    return this.http.put<any>(this.apiUrl, profileData, { headers });
  }
  getUserHouses(): Observable<any> {
    return this.http.get<any>(this.userHousesUrl);
  }
  getUserLands(): Observable<any> {
    return this.http.get<any>(this.userlandUrl);
  }
  getUserRooms(): Observable<any> {
    return this.http.get<any>(this.userroomUrl);
  }
  getImage(imageUrl: string): Observable<Blob> {
    return this.http.get(imageUrl, { responseType: 'blob' });
  }
}
