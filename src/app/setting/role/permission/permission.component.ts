import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PermissionData } from './permission';
import { PermissionGroup } from './permission-group';
import { RolePermission } from './role-permission';
import { RoleList } from 'src/app/authentication/token';
import { MatListOption } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
import { PermissionGroupService } from './permission-groud.service';
import { ROLE_TYPE } from '../role';
import { PermissionService } from './permission-service';
import { ROLE_PERMISSION } from './data.test';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})
export class PermissionComponent implements OnInit {
  dataTest = ROLE_PERMISSION;
  role: ROLE_TYPE = new ROLE_TYPE();
  // permissionGroups: PermissionGroup[] = [];
  rolePermissionAssigned: PermissionGroup[] = [];
  // rolePermissionAssigned: RoleList[] = [];
  selected: Array<any> = [];
  // selectedLeftIds: RoleList[] = [];
  // selectedRightIds: RoleList[] = [];
  durationInSeconds = environment.durationInSeconds;
  loading: boolean = false;

  constructor(
    private _snackBar: MatSnackBar,
    private permissionService: PermissionService,
    private dialogRef: MatDialogRef<PermissionComponent>,
    private permissionGroupService: PermissionGroupService,
    @Inject(MAT_DIALOG_DATA) public data: ROLE_TYPE
  ) {
    this.dialogRef.updateSize('500px')
    this.loading = true;
    this.role = data;
    this.getRolePermission(this.role.id);

  }

  ngOnInit(): void {

  }

  exist(permission_name: string): boolean {
    return PermissionData.exist(permission_name);
  }
  getRolePermission(roleId: number) {
    this.permissionService.getRolePermissions(roleId).subscribe((data) => {
      this.rolePermissionAssigned = data.data as PermissionGroup[];
      this.loading = false;
    });
  }

  onSubmit() {
    let rolePermissions: RolePermission[] = [];
    this.rolePermissionAssigned.forEach(item => {
      item.roleList.forEach(element => {
        if (element.completed) {
          rolePermissions.push(new RolePermission(element))
        }
      });
    }

    );
    this.permissionService
      .putRolePermission(this.role.id, rolePermissions)
      .subscribe((data) => {
        this.dialogRef.close();
      });

  }

  close() {
    this.dialogRef.close();
  }

  @HostListener('keydown.esc')
  public onEsc() {
    this.close();
  }

  updateAllComplete(permissionGroup: PermissionGroup) {


    permissionGroup.completed = permissionGroup.roleList != null && permissionGroup.roleList.every(t => t.completed);
  }
  someComplete(permissionGroup: PermissionGroup): boolean {
    if (permissionGroup.roleList == null) {
      return false;
    }
    return permissionGroup.roleList.filter(t => t.completed).length > 0 && !permissionGroup.completed;
  }

  setAll(completed: boolean, permissionGroup: PermissionGroup) {
    permissionGroup.completed = completed;
    if (permissionGroup.roleList == null) {
      return;
    }
    permissionGroup.roleList.forEach(t => (t.completed = completed));
  }
}
