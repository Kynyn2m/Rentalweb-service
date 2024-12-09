import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

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
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$') // Password pattern
      ]],
      confirmPassword: ['', [Validators.required]],  // Confirm password field
    });
  }

  get f() {
    return this.otpForm.controls;
  }

  // Method to handle OTP verification and password reset
  onSubmit(): void {
    if (this.otpForm.invalid) {
      return;
    }

    if (this.f['newPassword'].value !== this.f['confirmPassword'].value) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;

    // Prepare the body for the API request
    const resetData = {
      email: this.data.email,          // User's email passed in data
      otp: this.f['otp'].value,        // OTP entered by the user
      newPassword: this.f['newPassword'].value, // New password entered by the user
    };

    // Call the reset password API
    this.http.post(`${environment.apiUrl}/public/forgot-password/verify-otp`, resetData).subscribe({
      next: (response) => {
        console.log('API response:', response);  // Log the response to inspect its structure

        // Assuming the request is successful, trigger SweetAlert
        Swal.fire({
          title: 'Success!',
          text: 'OTP verified successfully and password has been reset.',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 3000,  // Auto-close after 3 seconds
        }).then(() => {
          this.dialogRef.close(true);  // Close the dialog after SweetAlert closes
        });
      },
      error: (err) => {
        console.error('Error during OTP verification:', err);  // Log the error to understand its structure
        this.error = err?.error?.message || 'An error occurred during OTP verification.';
        this.loading = false;

        // Trigger SweetAlert for errors
        Swal.fire({
          title: 'Success!',
          text: 'OTP verified successfully and password has been reset.',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 3000,  // Auto-close after 3 seconds
        }).then(() => {
          this.dialogRef.close(true);  // Close the dialog after SweetAlert closes
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
