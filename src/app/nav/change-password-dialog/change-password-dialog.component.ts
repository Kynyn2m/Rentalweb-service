import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.css']
})
export class ChangePasswordDialogComponent {
  passwordForm: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isLoading = false;  // Loading state

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;
      this.changePassword(currentPassword, newPassword);
    }
  }

  changePassword(currentPassword: string, newPassword: string): void {
    const payload = { currentPassword, newPassword };
    this.isLoading = true;

    this.http.post(`${environment.apiUrl}/me/password`, payload).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.snackBar.open('Password changed successfully!', 'Close', {
          duration: 3000,
        });
        this.dialogRef.close(true);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.handleApiError(error.error);
      }
    });
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'currentPassword') {
      this.hideCurrentPassword = !this.hideCurrentPassword;
    } else if (field === 'newPassword') {
      this.hideNewPassword = !this.hideNewPassword;
    } else if (field === 'confirmPassword') {
      this.hideConfirmPassword = !this.hideConfirmPassword;
    }
  }

  passwordStrengthValidator(control: any): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[\W_]/.test(value);
    const isValidLength = value.length >= 8;

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial && isValidLength;
    return !passwordValid ? { passwordStrength: true } : null;
  }

  passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  handleApiError(errorResponse: any): void {
    const code = errorResponse.code || 'Error';
    const message = errorResponse.message || 'Failed to change password';
    let errorDetail = '';

    // Loop through the errors and format them for display
    if (errorResponse.errors && errorResponse.errors.length > 0) {
      errorResponse.errors.forEach((err: any) => {
        const fieldName = err.name;
        const fieldErrors = err.messages.join(', ');
        errorDetail += `${fieldName}: ${fieldErrors}\n`;
      });
    }

    // Display the error code, main message, and detailed errors in the snackbar
    this.snackBar.open(`Code: ${code}\n${message}\n${errorDetail}`, 'Close', {
      duration: 5000,
    });
  }
}
