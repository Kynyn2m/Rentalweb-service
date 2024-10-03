import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Ensure you have the environment file properly set up

@Injectable({
  providedIn: 'root'
})
export class HouseService {

  private apiUrl = `${environment.apiUrl}/public/houses`; // Your API endpoint

  constructor(private http: HttpClient) { }

  // Method to create a new house post
  createPost(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }
}
