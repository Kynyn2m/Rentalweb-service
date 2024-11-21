import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css'],
})
export class AuthenticationComponent implements OnInit {
  @Output() messageEvent = new EventEmitter<boolean>();
  hide = true;
  loginForm!: UntypedFormGroup;
  loading = false;
  submitted = false;
  returnUrl!: string;
  error = '';

  constructor(
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    // Redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit(): void {
    // Initialize the login form
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    // Set default return URL after login
    this.returnUrl = '/home';
  }

  // Convenience getter for easy access to form controls
  get f(): any {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.submitted = true;
    this.loading = true;

    // Call the login method from the authentication service
    this.authenticationService
      .login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        (data) => {
          // On successful login, redirect and reload the page
          const redirectUrl = this.authenticationService.getRedirectUrl() || this.returnUrl;
          this.authenticationService.clearRedirectUrl(); // Clear the redirect URL after use
          this.router.navigate([redirectUrl]).then(() => {
            window.location.reload(); // Reload the page
          });
          this.loading = false;
        },
        (error) => {
          // Handle login failure
          this.error = 'Invalid login credentials. Please try again.';
          this.loading = false;
        }
      );
  }
}
