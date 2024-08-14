import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { RoleListData, Token } from './token';
import { ResponseModel } from '../_helpers/response-model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  getToken() {
    throw new Error('Method not implemented.');
  }
  private currentUserSubject: BehaviorSubject<Token | null>;
  public currentUser: Observable<Token | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<Token | null>(
      JSON.parse(localStorage.getItem('currentUser') || '{}')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): Token | null {
    return this.currentUserSubject.value;
  }

  public existAuthorization(roleName: string): boolean {
    // console.log('roleName:::', roleName);
    return RoleListData.exist(roleName);
  }

  public getUserId(): number {
    return this.currentUserValue!.id;
  }

  login(username: string, password: string) {
    return this.http
      .post<any>(`${environment.apiUrl}/users/v1/authenticate`, {
        username,
        password,
      })
      .pipe(
        map((responseModel: ResponseModel) => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          // localStorage.setItem('currentUser', JSON.stringify(responseModel.data));

          this.currentUserSubject.next(responseModel.data as Token);
          return responseModel;
        })
      );
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
