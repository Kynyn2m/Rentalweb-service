import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { MatDialog } from '@angular/material/dialog';  // Import MatDialog
import { ConfirmPasswordComponent } from '../confirm-password/confirm-password.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { VerifyOtpComponent } from '../verify-otp/verify-otp.component';
import { VerifyOtpRessetComponent } from '../verify-otp-resset/verify-otp-resset.component';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css', '../authentication.component.css'],
})
export class ForgetPasswordComponent implements OnInit {
  forgetPasswordForm: FormGroup;
  message: string = '';  // To display success or error message
  isSubmitting: boolean = false;  // To track the submission state

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthenticationService,  // Inject AuthenticationService
    public dialog: MatDialog  // Inject MatDialog to open the dialog
  ) {
    this.forgetPasswordForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email, // Validate email format
        ],
      ],
    });
  }

  ngOnInit(): void {}

  // Handle form submission
// Handle form submission
onSubmit(): void {
  if (this.forgetPasswordForm.valid) {
    this.isSubmitting = true;  // Start submitting
    const email = this.forgetPasswordForm.value.email;
    console.log('Form Submitted', email);

    // Call the forgotPassword service method
    this.authService.forgotPassword(email).subscribe(
      (response: any) => {
        // Handle success
        this.message = 'Password reset instructions have been sent to your email.';
        this.isSubmitting = false;  // Stop submitting

        // Open Reset Password Confirmation Dialog after the email is sent successfully
        this.openResetPasswordDialog(email);
      },
      (error) => {
        // Handle error
        console.error('Error during password reset:', error);
        this.message = 'There was an error processing your request.';
        this.isSubmitting = false;  // Stop submitting
      }
    );
  } else {
    console.log('Form is invalid');
    this.message = 'Please provide a valid email address.';
  }
}


  // Open Reset Password Confirmation Dialog
  openResetPasswordDialog(email: string): void {
    const dialogRef = this.dialog.open(VerifyOtpRessetComponent, {
      width: '400px',
      data: { email: email },  // Pass the email to the dialog
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Optionally handle success or redirect after dialog is closed
        this.router.navigate(['/login']);
      } else {
        // Optionally handle when dialog is closed without success
        console.log('Password reset dialog was closed without success.');
      }
    });
  }

  // Navigate to login page
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
