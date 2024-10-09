import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[]; // Array of permissions associated with the role
}



@Component({
  selector: 'app-assign-role-dialog',
  templateUrl: './assign-role-dialog.component.html',
  styleUrls: ['./assign-role-dialog.component.css'],
})
export class AssignRoleDialogComponent implements OnInit {
  roles: Role[] = [];
  selectedRoleIds: number[] = [];

  constructor(
    public dialogRef: MatDialogRef<AssignRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { roles: Role[]; assignedRoles: Role[] }
  ) {}

  ngOnInit(): void {
    // Initialize roles and currently assigned roles
    this.roles = this.data.roles || [];
    const assignedRoles = this.data.assignedRoles || [];

    // Mark roles as selected if they are already assigned
    this.selectedRoleIds = assignedRoles.map(role => role.id);
  }

  // Toggle role selection
  toggleRole(roleId: number): void {
    const index = this.selectedRoleIds.indexOf(roleId);
    if (index === -1) {
      this.selectedRoleIds.push(roleId);
    } else {
      this.selectedRoleIds.splice(index, 1);
    }
  }

  // Save selected roles
  onSave(): void {
    this.dialogRef.close(this.selectedRoleIds); // Pass the selected role IDs back
  }

  // Cancel dialog
  onCancel(): void {
    this.dialogRef.close();
  }
}
