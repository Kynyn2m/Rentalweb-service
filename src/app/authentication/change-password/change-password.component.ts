import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangePassword } from './change-password';
import { TranslocoService } from '@ngneat/transloco';
import { PermissionData } from '../../setting/role/permission/permission';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { ResetPassword } from './reset-password';
import { USER_TYPE } from '../../setting/user/user';
import { PasswordStrengthValidator } from './password-strengeth';
import { UserService } from '../../setting/user/user.service';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  matchPass = true;
  public fg: FormGroup;
  resetPassword: ResetPassword = new ResetPassword();
  dailogRef: any;
  dialog: any;

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordComponent>,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private readonly translocoService: TranslocoService,
    private authenticationService: AuthenticationService,
    fb: FormBuilder,
  ) {
    this.fg = fb.group({
      currentPassword: ['', [Validators.required]],
      password: ['', [Validators.required, PasswordStrengthValidator]],
      confirmPassword: ['', [Validators.required, PasswordStrengthValidator]]
    });
  }

  error = '';
  durationInSeconds = 3;
  loading: boolean = false;

  ngOnInit(): void {
  }

  onSearchChange(conPassValue: string): void {
    if (conPassValue === this.resetPassword.password) {
      this.matchPass = true;
    } else {
      this.matchPass = false;
    }
  }

  exist(permission_name: string): boolean {
    return PermissionData.exist(permission_name);
  }

  onSubmit(f: NgForm) {
    if (!this.fg.valid) {
      return;

    }

    if (!this.matchPass) {
      this._snackBar.open(this.translocoService.translate('not-matched-password'), this.translocoService.translate("close"), {
        duration: this.durationInSeconds * 1000
      });
      return;
    }

    this.loading = true;
    this.userService.changePassword(this.resetPassword).subscribe(
      (data) => {
        this.loading = false;
        this._snackBar.open(this.translocoService.translate("success"), this.translocoService.translate("close"), {
          duration: this.durationInSeconds * 1000
        });
      }, (error) => {
        this.loading = false;
      }
    );
  }

  checkAuth(roleName: string): boolean {
    return this.authenticationService.existAuthorization(roleName);
  }

  Onclose() {
    this.dialogRef.close(ChangePasswordComponent);
  }

  @HostListener('keydown.esc')
  public onEsc() {
    this.Onclose();
  }
}
