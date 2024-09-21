import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    if (this.authenticationService.currentUserValue) {
      // Redirect to dashboard if already logged in
      // this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit(): void {
    // Initialize the login form with validators
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    // Default return URL after login
    this.returnUrl = '/dashboard';
  }

  // Getter for easy access to form controls
  get f(): any {
    return this.loginForm.controls;
  }

  // Handle form submission
  onSubmit(): void {
    this.submitted = true;

    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const username = this.f.username.value;
    const password = this.f.password.value;

    // Check if login is for admin or regular user
    if (username === 'nomkiny' && password === 'nomkiny123') {
      // Simulated admin login token
      const adminToken =
        '{"id":1,"fullname":"Admin User","role":"admin","token":"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjoiUk9MRV9BRE1JTiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNzIwMDAwMDAwfQ.3Hn5tJa9K76E1lNNEd1UfBzlvLzD7h3kkBSG1uk9VbcWcEsBmdn4xsRSHUb-9W8mzlQOdjfDljEOWO6vwjDcg"}';

      // Save admin token in local storage
      localStorage.setItem('currentUser', adminToken);
      this.returnUrl = '/dashboard';  // Set admin dashboard as return URL
      window.location.replace(this.returnUrl);
    } else if (username === 'user' && password === 'user123') {
      // Simulated user login token
      const userToken =
        '{"id":2,"fullname":"Regular User","role":"user","token":"eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyIiwicm9sZXMiOiJST0xFX1VTRVIiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTcyMDAwMDAwMH0.2LTPqnHfOa9GtsmcgU2IM19EbHd4lzzNkRmD_WZnEkA5cM3s5yIDYZPZf6PvqMuBu9bHRx_c3joQg53JKw_gYg"}';

      // Save user token in local storage
      localStorage.setItem('currentUser', userToken);
      this.returnUrl = '/home';  // Set user dashboard as return URL
      window.location.replace(this.returnUrl);
    } else {
      // If login fails due to incorrect credentials, show error message with snack bar
      this.loading = false;
      this.snackBar.open('Invalid username or password', 'Close', {
        duration: 3000,  // Duration in milliseconds (3 seconds)
        panelClass: ['snackbar-error'],  // Custom style class for error message
      });
    }

    // Simulate API request (You can uncomment this part when you have backend)
    // this.authenticationService
    //   .login(this.f.username.value, this.f.password.value)
    //   .pipe(first())
    //   .subscribe(
    //     (data) => {
    //       this.messageEvent.emit(true);
    //       window.location.replace(this.returnUrl);
    //       this.loading = false;
    //     },
    //     (error) => {
    //       this.error = error;
    //       this.loading = false;
    //     }
    //   );
  }

  contacts: any;

  // HostListener to handle form submission with the Enter key
  @HostListener('keydown.enter')
  public onEnterPress() {
    this.onSubmit();
  }
}
