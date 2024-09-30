import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Token } from './token';  // Updated Token class
import { User } from './models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<Token | null>;
  public currentUser: Observable<Token | null>;

  constructor(private http: HttpClient) {
    // Retrieve the current user from localStorage if present
    const savedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<Token | null>(
      savedUser ? JSON.parse(savedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Getter for current user value
  public get currentUserValue(): Token | null {
    return this.currentUserSubject.value;
  }

  // Login method
  login(username: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${environment.apiUrl}/login`, { username, password })
      .pipe(
        map((responseModel) => {
          // Ensure the response contains the necessary data
          if (responseModel && responseModel.result) {
            const user: Token = {
              id: responseModel.result.id,
              fullname: responseModel.result.fullname || '',  // Add fullname if available
              token: responseModel.result.accessToken,  // Access token from API
              roleList: responseModel.result.roleList || [],  // Role list from API
              accessToken: responseModel.result.accessToken,  // Access token
              refreshToken: responseModel.result.refreshToken,  // Refresh token
            };

            // Store user details and token in local storage
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);  // Update the currentUserSubject
          }
          return responseModel;
        })
      );
  }
  register(user: User): Observable<any> {
    return this.http.post(`${environment.apiUrl}/public/users`, user);
  }

  // Logout method to remove user data from local storage
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Check if the current user has a specific role
  public existAuthorization(roleName: string): boolean {
    return this.currentUserValue?.roleList.some(role => role.name === roleName) ?? false;
  }

  // Get current user ID
  public getUserId(): number | null {
    return this.currentUserValue ? this.currentUserValue.id : null;
  }
}
