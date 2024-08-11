import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthenticationService } from '../authentication/authentication.service';
import { Router } from '@angular/router';
import { NavService } from '../nav/nav.service';
import { TranslocoService } from '@ngneat/transloco';
import { RoleList, RoleListData } from '../authentication/token';
import { PermissionService } from '../setting/role/permission/permission-service';
import { environment } from 'src/environments/environment';

@Injectable()
export class ErrInterceptor implements HttpInterceptor {
  durationInSeconds = environment.durationInSeconds;

  constructor(
    private authenticationService: AuthenticationService,
    private permissionService: PermissionService,
    private _snackBar: MatSnackBar,
    private router: Router,
    public navService: NavService,
    private readonly transloco: TranslocoService,
  ) { }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err.status === 401) {
          // auto logout if 401 response returned from api`
          this._snackBar.open(this.transloco.translate("unauthorize"), this.transloco.translate("close"), {
            duration: this.durationInSeconds * 1000
          });
          this.authenticationService.logout();
          this.router.navigate(['/login']);
        } else if (err.status === 403) {
          this._snackBar.open(this.transloco.translate("no-permission"), this.transloco.translate("close"), {
            duration: this.durationInSeconds * 1000
          });
          this.getPermissions();
          this.router.navigate(['/']);
        } else if (err.status === 200) {
        } else if (err.status === 204) {

        } else if (err.status === 404) {
          this._snackBar.open(this.transloco.translate("not-found"), this.transloco.translate("close"), {
            duration: this.durationInSeconds * 1000
          });
        } else if (err.status == 409) {
          this._snackBar.open(this.transloco.translate("exist"), this.transloco.translate("close"), {
            duration: this.durationInSeconds * 1000
          });
        } else if (err.status == 400) {
          this._snackBar.open(
            err.error.responseMessage || this.transloco.translate('bad-request'), this.transloco.translate("close"), {
            duration: this.durationInSeconds * 1000
          });
        }

        else {
          if (err.status) {
            this._snackBar.open(this.transloco.translate("unexprected-error"), this.transloco.translate("close"), {
              duration: this.durationInSeconds * 1000
            });
          } else {
            this._snackBar.open(this.transloco.translate("connection-lost"), this.transloco.translate("close"), {
              duration: this.durationInSeconds * 1000
            });
          }
        }
        const error = err.statusText;
        return throwError(error);
      }), finalize(() => {
        this.navService.isLoading.next(false);
      })
    );

  }

  getPermissions() {
    this.permissionService.getCurrentUserRole().subscribe(
      (result) => {
        RoleListData.roleListData = (result.data as RoleList[]);
      }
    );
  }
}
