import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Form, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { USER_TYPE } from '../user';
import { USER_FORM } from './data.test';

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css']
})
export class UserAddComponent {
  dataTest = USER_FORM;
  user: USER_TYPE = new USER_TYPE();
  error = '';
  loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UserAddComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: USER_TYPE,
  ) {
    this.user = data;
  }

  ngOnInit(): void { }


  onSubmit(f: NgForm) {
    if (!f.valid) {
      return
    }

    if (this.user.id) {
      this.userService.put(this.user).subscribe(
        (data) => {
          this.dialogRef.close();
        },
        (error) => {
          this.error = error.responseMessage;
        }
      );
    } else {
      this.userService.post(this.user).subscribe(
        (data) => {
          this.dialogRef.close();
        },
        (error) => {
          this.error = error.responseMessage;
        }
      )
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  @HostListener('keydown.esc')
  public onEsc() {

  }
}
