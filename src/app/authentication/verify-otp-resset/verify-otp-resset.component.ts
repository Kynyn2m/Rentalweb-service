import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

interface ApiResponse {
  code: number;
  message: string;
  result: string;
}


@Component({
  selector: 'app-verify-otp-resset',
  templateUrl: './verify-otp-resset.component.html',
  styleUrls: ['./verify-otp-resset.component.css'],
})
export class VerifyOtpRessetComponent implements OnInit {
  otpForm!: FormGroup;
  loading = false;
  error = '';
  hidePassword: boolean = true; // Controls visibility of new password
  hideConfirmPassword: boolean = true; // Controls visibility of confirm password

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<VerifyOtpRessetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string }  // Inject email data
  ) {
    // Prevent dialog from closing when clicking outside
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    // Initialize the form with OTP and new password fields
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
      ]],
      confirmPassword: ['', [Validators.required]],  // Confirm password field
    });
  }

  get f() {
    return this.otpForm.controls;
  }

  onSubmit(): void {
    if (this.otpForm.invalid) {
      return;
    }

    if (this.f['newPassword'].value !== this.f['confirmPassword'].value) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;

    const resetData = {
      email: this.data.email,
      otp: this.f['otp'].value,
      newPassword: this.f['newPassword'].value,
    };

    this.http.post<ApiResponse>(`${environment.apiUrl}/public/forgot-password/verify-otp`, resetData).subscribe({
      next: (response: ApiResponse) => {  // Use the ApiResponse interface
        console.log('API response:', response);

        if (response.code === 200.0 && response.result === 'OTP verified successfully') {
          Swal.fire({
            title: 'Success!',
            text: response.result,
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            this.dialogRef.close(true);
          });
        } else if (response.code === 400.0 && response.result === 'Invalid OTP') {
          // Handle invalid OTP case
          this.error = 'Invalid OTP. Please try again.';
          this.loading = false;
          Swal.fire({
            title: 'Error!',
            text: this.error,
            icon: 'error',
            confirmButtonText: 'OK',
          });
        } else {
          // Handle other unexpected responses
          this.error = 'Unexpected response from the server';
          this.loading = false;
          Swal.fire({
            title: 'Error!',
            text: this.error,
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      },
      error: (err) => {
        console.error('Error during OTP verification:', err);
        this.error = err?.error?.message || 'An error occurred during OTP verification.';
        this.loading = false;
        Swal.fire({
          title: 'Error!',
          text: this.error,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    });
  }



  // Close the dialog if the user cancels
  onCancel(): void {
    this.dialogRef.close(false);
  }

  // Toggle visibility of new password field
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  // Toggle visibility of confirm password field
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
