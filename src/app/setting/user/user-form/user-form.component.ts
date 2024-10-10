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
    console.log('Received data:', data);
    this.user = data;
    this.userForm = this.fb.group({
      fullName: [this.user.fullName],
      email: [this.user.email],
      gender: [this.user.gender],
      username: [this.user.username], // Display username in form
    });
  }

  ngOnInit(): void {}

  onSubmit(f: NgForm) {
    if (!f.valid) {
      return;
    }

    // Map the username to usernamer before sending to the API
    const updatedUser = {
      ...this.user, // Get all existing fields from the user
      usernamer: this.user.username // Map username from the form to usernamer
    };

    if (this.user.id) {
      this.userService.updateUser(updatedUser, this.user.id).subscribe(
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
  }


  onCancel(): void {
    this.dialogRef.close();
  }

  @HostListener('keydown.esc')
  public onEsc() {}
}
