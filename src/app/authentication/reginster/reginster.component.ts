import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { VerifyOtpComponent } from '../verify-otp/verify-otp.component';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reginster',
  templateUrl: './reginster.component.html',
  styleUrls: ['./reginster.component.css'],
})
export class ReginsterComponent implements OnInit {
  registerForm!: FormGroup;
  submitted = false;
  loading = false;
  error = '';
  hide: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private readonly authenticationService: AuthenticationService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator]], // Password Validator applied here
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator // Ensure passwords match
    });

  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
    return null;
  }

  // Custom password validator
  passwordValidator(control: AbstractControl) {
    const password = control.value;
    // Updated regex to enforce the presence of numbers, lowercase, uppercase, and special characters
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

    if (!passwordRegex.test(password)) {
      return { invalidPassword: true };
    }

    return null;
  }


  // Convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  // Handle form submission
  onSubmit(): void {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    const user = {
      fullName: this.f['fullName'].value,
      email: this.f['email'].value,
      username: this.f['username'].value,
      password: this.f['password'].value,
      confirmPassword: this.f['confirmPassword'].value
    };

    this.authenticationService.register(user).subscribe({
      next: () => {
        this.loading = false;

        // Open the VerifyOtp dialog after successful registration
        const dialogRef = this.dialog.open(VerifyOtpComponent, {
          width: '400px',
          data: { username: user.username,email: user.email }
        });

        // Handle dialog result
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // OTP verified, show success alert
            Swal.fire({
              icon: 'success',
              title: 'Registration Successful',
              text: 'Your registration was successful. Please log in.',
              confirmButtonText: 'OK'
            }).then(() => {
              // Navigate to login page after alert is closed
              this.router.navigate(['/login']);
            });
          } else {
            // OTP verification failed or canceled
            console.log('OTP verification canceled');
          }
        });
      },
      error: (err) => {
        this.error = err;
        this.loading = false;

        // Check if the API returned a code in the response
        if (err.error?.code) {
          switch (err.error.code) {
            case 400.9:
              this.snackBar.open('This email is already registered. Please try logging in or use a different email.', 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              break;
            case 400.0:
              if (err.error?.errors) {
                err.error.errors.forEach((error: any) => {
                  this.snackBar.open(`${error.name}: ${error.messages.join(', ')}`, 'Close', {
                    duration: 5000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                  });
                });
              } else {
                this.snackBar.open(err.error.message || 'Your request is incorrect.', 'Close', {
                  duration: 5000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                });
              }
              break;
            default:
              // Handle other status codes
              this.snackBar.open(err.error.message || 'An unexpected error occurred.', 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
              break;
          }
        } else {
          // General error handling if no code is provided
          this.snackBar.open('An error occurred. Please try again later.', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
