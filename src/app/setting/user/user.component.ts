import { RoleService } from 'src/app/setting/role/role.service';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from './user.service';
import { USER_TYPE } from './user';
import { UserFormComponent } from './user-form/user-form.component';
import Swal from 'sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FilterTemplate } from './user';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';
import { AssignRoleComponent } from './assign-role/assign-role.component';
import { AssignRoleDialogComponent, Role } from './assign-role-dialog/assign-role-dialog.component';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'id',
    'fullName',
    'gender',
    'email',
    'username',
    'other',
  ];
  dataSource = new MatTableDataSource<USER_TYPE>([]);
  isLoading = true;
  pagingModel: any;
  currentPage = 0;
  size = 10;
  searchText = '';
  filter: FilterTemplate = new FilterTemplate();
  pageSizeOptions: number[] = [5, 10, 25, 50];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  page = environment.currentPage;

  constructor(
    private dialog: MatDialog,
    private userService: UserService,
    private rolesService: RoleService,
    private changeDetectorRef: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getAll();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getAll() {
    this.isLoading = true;
    this.userService
      .gets(this.currentPage, this.size, this.searchText, this.filter)
      .subscribe(
        (res) => {
          console.log('API Response:', res); // Debugging line
          if (res && res.result) {
            this.pagingModel = res.result;

            // Filter out users with ID of 0, specifying the user type explicitly
            const filteredUsers = this.pagingModel.result.filter(
              (user: USER_TYPE) => user.id !== 0
            );

            // Assign filtered users to dataSource
            this.dataSource.data = filteredUsers;

            this.paginator.length = this.pagingModel.totalElements;
          } else {
            console.error('Unexpected API response structure:', res);
          }
          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        },
        (error) => {
          this.isLoading = false;
          this.snackBar.open('Error fetching users', 'Close', {
            duration: 3000,
          });
          console.error('Error fetching data:', error);
        }
      );
  }

  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
    const wb: XLSX.WorkBook = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Create a blob and trigger the download
    const fileName = 'user_data.xlsx';
    const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(data);
    link.download = fileName;
    link.click();
  }

  onSearch() {
    this.currentPage = 0; // Reset to the first page on a new search
    this.getAll();
  }

  pageChanged(event: PageEvent) {
    this.size = event.pageSize;
    this.currentPage = event.pageIndex;
    this.getAll();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openAssignRoleDialog(user: any): void {
    this.rolesService.getRoles().subscribe((response) => {
      const roles: Role[] = response.result.result; // Assuming 'result' contains the list of roles

      // Open the dialog and pass the list of roles
      const dialogRef = this.dialog.open(AssignRoleDialogComponent, {
        width: '400px',
        data: {
          roles: roles, // Pass the roles to the dialog
          assignedRoles: user.roles // Pass currently assigned roles
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Assign selected role IDs to the user
          this.assignRolesToUser(user.id, result);
        }
      });
    });
  }

  assignRolesToUser(userId: number, roleIds: number[]): void {
    // Call the user service to assign roles
    this.userService.assignRolesToUser(userId, roleIds).subscribe(() => {
      console.log('Roles successfully assigned to user.');
      // Show success alert
      Swal.fire('Success', 'Roles have been successfully assigned.', 'success');
    }, error => {
      console.error('Error assigning roles:', error);
      Swal.fire('Error', 'Failed to assign roles.', 'error');
    });
  }


  assignRole(user: USER_TYPE) {
    console.log('Assign role to user:', user);

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';
    dialogConfig.data = user;

    const dialogRef = this.dialog.open(AssignRoleComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.assignedRoles && result.assignedRoles.length > 0) {
        const roles = result.assignedRoles.map((role: { id: number }) => ({
          roleId: role.id,
        }));

        // Ensure both user.id and roles are provided
        this.userService.getUserRoles(user.id, roles).subscribe(
          (response) => {
            console.log('User assigned successfully:', response);
            this.getAll();
            this.snackBar.open('User assigned successfully', 'Close', {
              duration: 3000,
            });
          },
          (error) => {
            console.error('Error assigning User:', error);
            this.snackBar.open('Error assigning user', 'Close', {
              duration: 3000,
            });
          }
        );
      } else {
        console.error('No roles selected');
        this.snackBar.open('No roles selected', 'Close', { duration: 3000 });
      }
    });
  }
  updateDialog(user: USER_TYPE): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true; // Prevent closing the dialog by clicking outside
    dialogConfig.autoFocus = true; // Automatically focus the dialog input
    dialogConfig.data = user; // Pass the user data to the dialog

    this.dialog
      .open(UserFormComponent, dialogConfig)
      .afterClosed()
      .subscribe((updatedUser: USER_TYPE | undefined) => {
        // Check if the dialog returned an updated user object
        if (updatedUser) {
          // Call the updateUser method to save changes
          this.userService.updateUser(updatedUser, updatedUser.id).subscribe(
            (res) => {
              // Use default success message if 'message' is missing in the response
              const message =
                (res as any)?.message || 'User updated successfully';
              this.snackBar.open(message, 'Close', { duration: 3000 });
              this.getAll(); // Refresh the user list after update
            },
            (error) => {
              // Display error message and log it
              this.snackBar.open('Error updating user', 'Close', {
                duration: 3000,
              });
              console.error('Error updating user:', error);
            }
          );
        }
      });
  }

  deleteConfirm(user: USER_TYPE): void {
    Swal.fire({
      title: `Delete ${user.username}?`,
      text: 'Are you sure you want to delete this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.id).subscribe(
          () => {
            Swal.fire('Deleted!', 'User has been deleted.', 'success');
            this.getAll(); // Reload data after deletion
          },
          (error) => {
            Swal.fire('Error', 'Failed to delete user', 'error');
            console.error('Error deleting user:', error);
          }
        );
      }
    });
  }
}
