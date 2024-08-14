import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  NgForm,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { UserService } from 'src/app/setting/user/user.service';
import { ForgetPassword } from './forget-password';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: [
    './forget-password.component.css',
    '../authentication.component.css',
  ],
})
export class ForgetPasswordComponent implements OnInit {
  forgetPasswordForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)],
      ],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.forgetPasswordForm.valid) {
      console.log('Form Submitted', this.forgetPasswordForm.value);
      // Implement the password reset logic here
    } else {
      console.log('Form is invalid');
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
