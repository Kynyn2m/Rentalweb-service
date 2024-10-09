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

  // Get profile information
  getProfile(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Update profile
  updateProfile(profileData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'enctype': 'multipart/form-data'
    });

    return this.http.put<any>(this.apiUrl, profileData, { headers });
  }

  // Get user houses
  getUserHouses(): Observable<any> {
    return this.http.get<any>(this.userHousesUrl);
  }

  // Get user lands
  getUserLands(): Observable<any> {
    return this.http.get<any>(this.userlandUrl);
  }

  // Get user rooms
  getUserRooms(): Observable<any> {
    return this.http.get<any>(this.userroomUrl);
  }

  // Get images
  getImage(imageUrl: string): Observable<Blob> {
    return this.http.get(imageUrl, { responseType: 'blob' });
  }

  // **Delete a house by ID**
  deleteHouse(houseId: number): Observable<any> {
    const url = `${environment.apiUrl}/public/houses/${houseId}`;
    return this.http.delete<any>(url);
  }

  // **Delete a land by ID**
  deleteLand(landId: number): Observable<any> {
    const url = `${environment.apiUrl}/public/lands/${landId}`;
    return this.http.delete<any>(url);
  }

  // **Delete a room by ID**
  deleteRoom(roomId: number): Observable<any> {
    const url = `${environment.apiUrl}/public/rooms/${roomId}`;
    return this.http.delete<any>(url);
  }
}
