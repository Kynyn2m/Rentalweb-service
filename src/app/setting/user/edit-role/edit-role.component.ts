import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserAddComponent } from '../user-add/user-add.component';

@Component({
  selector: 'app-edit-role',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.css']
})
export class EditRoleComponent {
  userForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UserAddComponent>,
    private fb: FormBuilder
  ) {

    this.userForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      status: ['', Validators.required]
    });
  }

  onSave(): void {
    if (this.userForm.valid) {
      this.dialogRef.close(this.userForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
