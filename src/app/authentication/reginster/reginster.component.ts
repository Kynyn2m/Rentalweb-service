import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { User } from '../models/user.interface';
import { VerifyOtpComponent } from '../verify-otp/verify-otp.component';
import { MatDialog } from '@angular/material/dialog';

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
    private authenticationService: AuthenticationService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator // Add the custom validator here
    });
  }

  // Custom validator to check if password and confirmPassword match
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
      phoneNumber: this.f['phoneNumber'].value,
      password: this.f['password'].value,
      confirmPassword: this.f['confirmPassword'].value
    };

    this.authenticationService.register(user).subscribe({
      next: () => {
        this.loading = false;

        // Open the VerifyOtp dialog after successful registration
        const dialogRef = this.dialog.open(VerifyOtpComponent, {
          width: '400px',
          data: { phoneNumber: user.phoneNumber }
        });

        // Handle dialog result
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // OTP verified, navigate to home or dashboard
            this.router.navigate(['/home']);
          } else {
            // OTP verification failed or canceled
            console.log('OTP verification canceled');
          }
        });
      },
      error: (err) => {
        this.error = err;
        this.loading = false;
      }
    });
  }
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
