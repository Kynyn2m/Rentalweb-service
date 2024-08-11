import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ROLE_TYPE, RoleAssigned } from '../../role/role';
import { PaggingModel } from 'src/app/_helpers/response-model';
import { RoleService } from '../../role/role.service';
import { UserService } from '../user.service';
import { USER_TYPE } from '../user';
import { NgForm } from '@angular/forms';
import { ASSIGN_ROLE } from './data.test';

@Component({
  selector: 'app-assign-role',
  templateUrl: './assign-role.component.html',
  styleUrls: ['./assign-role.component.css'],
})
export class AssignRoleComponent implements OnInit {
  dataTest = ASSIGN_ROLE;
  [x: string]: any;
  user: USER_TYPE = new USER_TYPE();
  roles: ROLE_TYPE[] = [];
  assignedRoles: ROLE_TYPE[] = [];
  loading: boolean = false;


  constructor(
    private dailogRef: MatDialogRef<AssignRoleComponent>,
    private roleService: RoleService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: USER_TYPE
  ) {
    this.dailogRef.updateSize('400px');
    this.loading = true;
  }

  ngOnInit(): void {
    this.user = this.data;
    this.getRoles();
    this.getAssignedRole(this.user.id);
  }

  getRoles() {
    this.roleService.getAll().subscribe((data) => {
      this.roles = (data.data as PaggingModel).result;
      this.loading = !true;
    });
  }

  getAssignedRole(userId: number) {
    this.userService.getAssignedRole(userId).subscribe((resp) => {
      this.assignedRoles = resp.data as ROLE_TYPE[];
    });
  }

  cbChanged(checked: boolean, role: ROLE_TYPE) {
    if (checked) {
      this.assignedRoles.push(role);
    } else {
      let rpm = this.assignedRoles.findIndex((d) => d.id == role.id);
      this.assignedRoles.splice(rpm, 1);
    }
  }

  roleChecked(role: ROLE_TYPE): boolean {
    let rpm = this.assignedRoles.find((d) => d.id == role.id);
    if (rpm != null) {
      return true;
    } else {
      return false;
    }
  }

  onSubmit(f: NgForm): void {
    if (!f.valid) {
      return;
    }
    let roles = this.assignedRoles.map((item) => new RoleAssigned(item));
    this.userService.postUserRole(this.user.id, roles).subscribe((data) => {
      this.dailogRef.close();
    });
  }

  close() {
    this.dailogRef.close();
  }

  @HostListener('keydown.esc')
  public onEsc() {
    this.close();
  }
}
