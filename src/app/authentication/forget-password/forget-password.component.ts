import { Component } from '@angular/core';
import { NgForm, UntypedFormControl, Validators } from '@angular/forms';
import { UserService } from 'src/app/setting/user/user.service';
import { ForgetPassword } from './forget-password';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css', '../authentication.component.css']
})
export class ForgetPasswordComponent {
  forgetPass: ForgetPassword = new ForgetPassword;
  email = new UntypedFormControl('', [Validators.required, Validators.email]);

  hide = true;
  error = "";
  loading = false;


  constructor(
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    //
  }

  onSubmit(f: NgForm) {
    if (!f.valid) {
      return;
    }
    this.loading = true;
    this.userService.postForgetPasswordRequest(this.forgetPass.mail).subscribe(
      (data) => {
        window.location.replace('/confirm-password');
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }

}
