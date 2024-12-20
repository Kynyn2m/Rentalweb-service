import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  private houseStatusCounts: { [key: string]: number } = {
    new: 0,
    recent: 0,
    old: 0,
    // Other status categories
  };

  private apiUrl = `${environment.apiUrl}/public/dashboard`;

  constructor(private http: HttpClient) {}


  getDashboardData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

   // Set the house status counts
   setHouseStatusCounts(statusCounts: { [key: string]: number }): void {
    this.houseStatusCounts = statusCounts;
  }

  // Get the house status counts
  getHouseStatusCounts(): { [key: string]: number } {
    return this.houseStatusCounts;
  }
}
