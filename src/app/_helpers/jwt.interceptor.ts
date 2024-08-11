import { EventEmitter, Injectable, Output } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';
import { NavService } from '../nav/nav.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  @Output() isLoadingEvents = new EventEmitter<boolean>();

  constructor(
    private authenticationService: AuthenticationService,
    public navService: NavService
  ) { }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    this.navService.isLoading.next(true);
    // add authorization header with jwt token if available
    let currentUser = this.authenticationService.currentUserValue;
    if (currentUser && currentUser.token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
    }
    return next.handle(request);
  }
}
