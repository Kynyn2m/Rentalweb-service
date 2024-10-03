import { Component, HostListener, Inject } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { USER_FORM } from '../user-add/data.test';
import { USER_TYPE } from '../user';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  borderError: boolean = false;
  departments: USER_TYPE[] = [];
  isEditMode: boolean = false;
  userForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UserFormComponent>,
    private userService: UserService,
    private readonly snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: USER_TYPE,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    console.log('Received data:', data); // Check the data
    this.user = data;
    this.userForm = this.fb.group({
      fullName: [this.user.fullName],
      email: [this.user.email],
      gender: [this.user.gender],
      username: [this.user.username],
    });
  }
  ngOnInit(): void {}

  onSubmit(f: NgForm) {
    if (!f.valid) {
      return;
    }
    if (this.user.id) {
      this.userService.updateUser(this.user, this.user.id).subscribe(
        (data) => {
          this.snackBar.open('User updated successfully!', 'Close', {
            duration: 3000,
          });
          this.dialogRef.close();
        },
        (error) => {
          console.error('Update error:', error); // Log the complete error for debugging
          this.snackBar.open(
            'Failed to update user. Please try again.',
            'Close',
            {
              duration: 3000,
            }
          );
          this.error = error.error?.message || 'An unknown error occurred.';
        }
      );
    }
    // else {
    //   this.userService.createUser(this.user).subscribe(
    //     (data) => {
    //       this.dialogRef.close();
    //     },
    //     (error) => {
    //       this.error = error.responseMessage;
    //     }
    //   );
    // }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  @HostListener('keydown.esc')
  public onEsc() {}
}
