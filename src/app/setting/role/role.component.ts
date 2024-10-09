import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FilterTemplate, ROLE_TYPE } from './role';
import { RoleService } from './role.service';
import {
  MatDialog,
  MatDialogConfig,
} from '@angular/material/dialog';
import { PermissionComponent } from './permission/permission.component';
import { PermissionData } from './permission/permission';
import { ConfirmService } from 'src/app/components/confirm/confirm.service';
import { PaggingModel, ResponseModel } from 'src/app/_helpers/response-model';
import { TranslocoService } from '@ngneat/transloco';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { environment } from 'src/environments/environment';
import { AddRoleDesComponent } from './add-role-des/add-role-des.component';
import { NavComponent } from 'src/app/nav/nav.component';
import { ROLE } from './data.test';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssignPermissionsDialogComponent } from './assign-permissions-dialog/assign-permissions-dialog.component';
import { PermissionsService } from './assign-permissions-dialog/permissions.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css', '../../styles/styled.table.css']
})
export class RoleComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ROLE_TYPE>;

  displayedColumns: string[] = ['id', 'name', 'description', 'other'];
  dataSource = new MatTableDataSource<ROLE_TYPE>([]);
  isLoading = true;
  pagingModel?: PaggingModel;
  currentPage = 0;
  searchText = '';
  searchUpdate = new Subject<string>();
  size = environment.pageSize;
  pageSizeOptions: number[] = environment.pageSizeOptions;
  filter: FilterTemplate = new FilterTemplate();
  error = '';

  page = environment.currentPage;

  constructor(
    public dialog: MatDialog,
    private roleService: RoleService,
    private confirmService: ConfirmService,
    private changeDetectorRef: ChangeDetectorRef,
    private translocoService: TranslocoService,
    private authenticationService: AuthenticationService,
    private permissionsService: PermissionsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getAll();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // Fetch all roles with pagination and search
  getAll() {
    this.isLoading = true;
    this.roleService.gets(this.currentPage, this.size, this.searchText, this.filter).subscribe(
      (res: ResponseModel) => {
        if (res && res.result && res.result.result) {
          const pagingModel = res.result;
          this.pagingModel = pagingModel;
          console.log("API Response:", res);
          console.log("Roles:", pagingModel.result);
          this.dataSource.data = pagingModel.result;
        } else {
          console.error('Unexpected API response structure:', res);
        }
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      (error) => {
        this.error = 'Error fetching roles';
        console.error('Error:', error);
        this.isLoading = false;
      }
    );
  }
  newDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = new ROLE_TYPE();

    this.dialog
      .open(AddRoleDesComponent, dialogConfig)
      .afterClosed()
      .subscribe(() => this.getAll());
  }
  openAssignPermissionsDialog(role: any): void {
    // Fetch permissions from the API using PermissionsService
    this.permissionsService.getPermissions().subscribe((response) => {
      const permissions = response.result; // Assuming result contains the list of permissions

      // Open the dialog with permissions data
      const dialogRef = this.dialog.open(AssignPermissionsDialogComponent, {
        width: '650px',
        data: {
          permissions: permissions, // Pass the permissions to the dialog
          assignedPermissions: role.permissions // Pass currently assigned permissions
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Assign permission IDs to the role (result contains the selected permission IDs)
          this.assignPermissionsToRole(role.id, result);
        }
      });
    });
  }

  // Method to assign permissions to a role
  assignPermissionsToRole(roleId: number, permissionIds: number[]): void {
    this.permissionsService.assignPermissionsToRole(roleId, permissionIds).subscribe(() => {
      // Show SweetAlert on success
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Permissions have been successfully assigned to the role.',
        timer: 3000,  // Optional: Auto-close after 3 seconds
        showConfirmButton: false
      });
    }, error => {
      console.error('Error assigning permissions:', error);
      // Show SweetAlert on error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to assign permissions. Please try again.'
      });
    });
  }
  updateDialog(role: ROLE_TYPE): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = role;

    this.dialog.open(AddRoleDesComponent, dialogConfig).afterClosed().subscribe((updatedRole: ROLE_TYPE) => {
      if (updatedRole) {
        this.roleService.updateRole(updatedRole).subscribe(
          (res) => {
            const message = res?.message || 'Role updated successfully';
            this.snackBar.open(message, 'Close', { duration: 3000 });
            this.getAll();  // Refresh the role list after update
          },
          (error) => {
            this.snackBar.open('Error updating role', 'Close', { duration: 3000 });
            console.error('Error:', error);
          }
        );
      }
    });
  }

  deleteConfirm(role: ROLE_TYPE): void {
    const options = {
      title: `${this.translocoService.translate('delete')} ${this.translocoService.translate('role')}`,
      message: `${this.translocoService.translate('delete-confirmation')} ${role.name}?`,
      cancelText: this.translocoService.translate('cancel'),
      confirmText: this.translocoService.translate('yes'),
    };

    this.confirmService.open(options);
    this.confirmService.confirmed().subscribe((confirmed) => {
      if (confirmed) {
        this.roleService.delete(role.id).subscribe(
          (res) => {
            const message = res?.message || 'Role deleted successfully';
            this.snackBar.open(message, 'Close', { duration: 3000 });
            this.getAll();
          },
          (error) => {
            this.snackBar.open('Error deleting role', 'Close', { duration: 3000 });
            console.error('Error:', error);
          }
        );
      }
    });
  }


  // Handle pagination change
  pageChanged(event: PageEvent): void {
    this.size = event.pageSize;
    this.currentPage = event.pageIndex;
    this.getAll();
  }

  // Apply table filter
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Check if user has authorization
  checkAuth(roleName: string): boolean {
    return this.authenticationService.existAuthorization(roleName);
  }
}
