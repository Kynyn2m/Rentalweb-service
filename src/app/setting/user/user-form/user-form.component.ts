import { Component, HostListener, Inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { USER_FORM } from '../user-add/data.test';
import { USER_TYPE } from '../user';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent {
  dataTest = USER_FORM;
  user: USER_TYPE = new USER_TYPE();
  error = '';
  loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UserFormComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: USER_TYPE
  ) {
    this.user = data;
  }

  ngOnInit(): void {}

  onSubmit(f: NgForm) {
    // if (!f.valid) {
    //   return;
    // }
    // if (this.user.id) {
    //   this.userService.put(this.user.id, this.user).subscribe(
    //     (data) => {
    //       this.dialogRef.close();
    //     }
    //   );
    // } else {
    //   this.userService.post(this.user).subscribe(
    //     (data) => {
    //       this.dialogRef.close();
    //     }
    //   );
    // }
    // if (!f.valid) {
    //   return
    // }
    // if (this.user.id) {
    //   this.userService.put(this.user).subscribe(
    //     (data) => {
    //       this.dialogRef.close();
    //     },
    //     (error) => {
    //       this.error = error.responseMessage;
    //     }
    //   );
    // } else {
    //   this.userService.post(this.user).subscribe(
    //     (data) => {
    //       this.dialogRef.close();
    //     },
    //     (error) => {
    //       this.error = error.responseMessage;
    //     }
    //   )
    // }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  @HostListener('keydown.esc')
  public onEsc() {}
}
