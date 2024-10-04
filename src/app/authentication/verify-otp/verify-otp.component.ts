import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent implements OnInit {
  otpForm!: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<VerifyOtpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { username: string }  // Inject phone number data
  ) {
    // Prevent dialog from closing when clicking outside
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    // Initialize the form with the OTP field
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  get f() {
    return this.otpForm.controls;
  }

  // Method to handle OTP verification
  onSubmit(): void {
    if (this.otpForm.invalid) {
      return;
    }

    this.loading = true;

    // Prepare the body for the API request
    const otpData = {
      username: this.data.username,  // Phone number from the dialog data
      otp: this.f['otp'].value             // OTP from the form
    };

    // Call the verify-otp API
    this.http.post(`${environment.apiUrl}/public/verify-otp`, otpData).subscribe({
      next: (response) => {
        this.loading = false;
        // Close the dialog and return success
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.error = err.error.message || 'OTP verification failed';
        this.loading = false;
      }
    });
  }

  // Close the dialog if the user cancels
  onCancel(): void {
    this.dialogRef.close(false);
  }
}
