import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-assign-permissions-dialog',
  templateUrl: './assign-permissions-dialog.component.html',
  styleUrls: ['./assign-permissions-dialog.component.css']
})
export class AssignPermissionsDialogComponent implements OnInit {
  permissions: any[] = []; // List of permissions from API
  selectedPermissionIds: number[] = []; // Track selected permission IDs

  constructor(
    public dialogRef: MatDialogRef<AssignPermissionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.permissions = this.data.permissions; // Get permissions from data passed to the dialog
    // Pre-select already assigned permission IDs
    this.selectedPermissionIds = this.data.assignedPermissions.map((permission: any) => permission.id);
  }

  // Close the dialog and return the selected permissions by ID
  save(): void {
    this.dialogRef.close(this.selectedPermissionIds); // Return selected permission IDs
  }

  // Handle cancel action
  cancel(): void {
    this.dialogRef.close();
  }

  // Toggle permission selection
  togglePermission(permissionId: number): void {
    const index = this.selectedPermissionIds.indexOf(permissionId);
    if (index === -1) {
      this.selectedPermissionIds.push(permissionId); // Add if not selected
    } else {
      this.selectedPermissionIds.splice(index, 1); // Remove if already selected
    }
  }
}
