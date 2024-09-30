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
export class AddRoleDesComponent  {
  roleForm: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddRoleDesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ROLE_TYPE,
    private roleService: RoleService
  ) {
    this.isEditMode = !!data?.id;
    this.roleForm = this.fb.group({
      name: [data.name || '', [Validators.required, Validators.minLength(3)]],
      description: [data.description || '', [Validators.required]],
    });
  }

  save(): void {
    if (this.roleForm.valid) {
      const roleData: ROLE_TYPE = {
        id: this.data?.id,
        ...this.roleForm.value,
      };

      if (this.isEditMode) {

        this.roleService.updateRole(roleData).subscribe(
          (res) => {
            console.log('Role updated successfully', res);
            this.dialogRef.close(roleData);
          },
          (error) => {
            console.error('Error updating role:', error);
          }
        );
      } else {

        this.roleService.createRole(roleData).subscribe(
          (res) => {
            console.log('Role created successfully', res);
            this.dialogRef.close(roleData);
          },
          (error) => {
            console.error('Error creating role:', error);
          }
        );
      }
    }
  }
  close(): void {
    this.dialogRef.close();
  }
}
