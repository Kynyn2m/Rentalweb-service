import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AssignRoleComponent } from './assign-role/assign-role.component';
import { UserService } from './user.service';
import { FilterTemplate, RecommentFilter, Template, USER_TYPE } from './user';
import { PaggingModel, ResponseModel } from 'src/app/_helpers/response-model';
import { TranslocoService } from '@ngneat/transloco';
import { ConfirmService } from 'src/app/components/confirm/confirm.service';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { NavComponent } from 'src/app/nav/nav.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { environment } from 'src/environments/environment';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { USER } from './data.test';
import { UserFormComponent } from './user-form/user-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css', '../../styles/styled.table.css'],
})
export class UserComponent {
  displayedColumns: string[] = [
    'id',
    'fullName',
    'gender',
    'email',
    'username',
    'other',
  ];
  // dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  dataSource = new MatTableDataSource<USER_TYPE>();

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  size = environment.pageSize;
  page = environment.currentPage;
  error: any;
  searchText: string = '';
  searchUpdate = new Subject<string>();
  currentPage = 0;
  rowClicked = -1;
  _filter: FilterTemplate = new FilterTemplate();
  pagingModel?: PaggingModel;
  pageSizeOptions: number[] = environment.pageSizeOptions;
  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  // }
  ngOnInit(): void {
    this.getAll();
  }

  readonly dialog = inject(MatDialog);

  // openDialog() {
  //   this.dialog.open(UserAddComponent );
  // }
  constructor(
    // private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private navComponent: NavComponent,
    private confirmService: ConfirmService,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly translocoService: TranslocoService,
    private authenticationService: AuthenticationService
  ) {}
  getAll() {
    this.navComponent._loading = true;
    this.userService
      .gets(this.page, this.size, this.searchText, this._filter)
      .subscribe(
        (res) => {
          const pagingModel = (res as ResponseModel).result;
          this.pagingModel = pagingModel;
          this.dataSource.data = (pagingModel as PaggingModel).result;
          this.changeDetectorRef.detectChanges();
          this.navComponent._loading = false;
        },
        (error) => {
          this.error = error;
          // this.navComponent._loading = false;
        }
      );
  }
  updateUser(user: USER_TYPE) {
    if (user.status === 'DEL') return; // Make sure the status check is correct

    console.log('User to be updated:', user); // Check if fullName is included

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.width = '750px';
    dialogConfig.autoFocus = true;
    dialogConfig.data = user;

    this.dialog
      .open(UserFormComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        this.getAll(); // Refresh data after dialog closes
      });
  }
  deleteConfirm(user: USER_TYPE) {
    const options = {
      title: `${this.translocoService.translate(
        'delete'
      )} ${this.translocoService.translate('user')}`,
      message: `${this.translocoService.translate('delete-confirmation')} ${
        user.username
      }?`,
      cancelText: this.translocoService.translate('cancel'),
      confirmText: this.translocoService.translate('yes'),
    };

    this.confirmService.open(options);

    this.confirmService.confirmed().subscribe((confirmed) => {
      if (confirmed) {
        this.userService.deleteUser(user.id).subscribe((data) => {
          this.getAll();
        });
      }
    });
  }

  // assignRole(user: USER_TYPE) {
  //   console.log('Assign role to user:', user);
  //   const dialogConfig = new MatDialogConfig();
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.width = '600px';
  //   dialogConfig.data = user;
  //   const dialogRef = this.dialog.open(AssignRoleComponent, dialogConfig);
  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result && result.assignedRoles) {
  //       const roles = result.assignedRoles.map((role: { id: number }) => ({
  //         roleId: role.id,
  //       }));
  //       this.userService.getUserRoles(roles).subscribe(
  //         (response) => {
  //           console.log('User assigned successfully:', response);
  //           this.getAll();
  //           this.snackBar.open('User assigned successfully', 'Close', {
  //             duration: 3000,
  //           });
  //         },
  //         (error) => {
  //           console.error('Error assigning User:', error);
  //           this.snackBar.open('Error assigning user', 'Close', {
  //             duration: 3000,
  //           });
  //         }
  //       );
  //     }
  //   });
  // }
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

  pageChanged(event: PageEvent) {
    this.size = event.pageSize;
    this.page = event.pageIndex;
    this.getAll();
  }
}
