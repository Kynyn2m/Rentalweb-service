import { Component, HostListener, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ROLE_TYPE } from '../role';
import { RoleService } from '../role.service';
import { PermissionData } from '../permission/permission';
import { ROLE_FORM } from './data.test';

@Component({
  selector: 'app-add-role-des',
  templateUrl: './add-role-des.component.html',
  styleUrls: ['./add-role-des.component.css']
})
export class AddRoleDesComponent implements OnInit {
  dataTest = ROLE_FORM;
  role: ROLE_TYPE = new ROLE_TYPE();
  error = '';
  loading = false;


  constructor(
    public dialogRef: MatDialogRef<AddRoleDesComponent>,
    private roleService: RoleService,
    @Inject(MAT_DIALOG_DATA) public data: ROLE_TYPE,
  ) {
    this.dialogRef.updateSize('400px')
    this.role = data;
  }
  ngOnInit(): void { }

  exist(permission_name: string): boolean {
    return PermissionData.exist(permission_name);
  }



  onSubmit(f: NgForm) {
    if (!f.valid) {
      return;
    }

    this.loading = true;
    if (this.role.id) {
      this.roleService.put(this.role.id, this.role).subscribe(
        (data) => {
          this.dialogRef.close();
        },
        (error) => {
          this.error = error;
          this.loading = false;
        }
      );
    } else {
      this.roleService.post(this.role).subscribe(
        (data) => {
          this.dialogRef.close();
        },
        (error) => {
          this.error = error;
          this.loading = false;
        }
      );
    }
  }


  close() {
    this.dialogRef.close();
  }

  @HostListener('keydown.esc')
  public onEsc() {
    this.close();
  }
}
