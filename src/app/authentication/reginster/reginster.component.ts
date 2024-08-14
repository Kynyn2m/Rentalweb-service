import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reginster',
  templateUrl: './reginster.component.html',
  styleUrls: ['./reginster.component.css'],
})
export class ReginsterComponent implements OnInit {
  registerForm: FormGroup;
  hide: boolean = true;

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        phoneNumber: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/),
          ],
        ],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  ngOnInit(): void {}

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      console.log('Form Submitted', this.registerForm.value);
      // Perform the registration logic here
    } else {
      console.log('Form is invalid');
    }
  }
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
