import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from 'src/app/setting/user/user.service';

@Component({
  selector: 'app-confirm-password',
  templateUrl: './confirm-password.component.html',
  styleUrls: ['./confirm-password.component.css', '../authentication.component.css']
})
export class ConfirmPasswordComponent {
  password!: string;
  confirmPassword!: string;
  signature!: string;

  hide = true;
  error = "";
  loading: boolean = false;

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit(): void {
  }

  onSubmit(f: NgForm) {
    if (!f.valid) {
      return;
    }
    this.loading = true;
    this.userService.postForgetPasswordVerify(this.signature, this.password, this.confirmPassword).subscribe(
      (data) => {
        this.loading = false;
        window.location.replace('/login');
      }
    );
  }

}
