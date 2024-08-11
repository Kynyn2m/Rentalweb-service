import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
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
    private router: Router) {
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    // localStorage.removeItem('currentUser');
    // get return url from route parameters or default to '/'
    //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.returnUrl = '/dashboard';
  }

  get f(): any {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    // Dev no auth
    this.returnUrl = '/dashboard';
    window.location.replace(this.returnUrl);

    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.loading = true;
    this.authenticationService
      .login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        (data) => {
          this.messageEvent.emit(true);
          window.location.replace(this.returnUrl);
          this.loading = false;
        },
        (error) => {
          this.error = error;
          this.loading = false;
        }
      );
  }

  contacts: any;

  @HostListener('keydown.enter')
  public onEsc() {
    this.onSubmit()
  }
}
