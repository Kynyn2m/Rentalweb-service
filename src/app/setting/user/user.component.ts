import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { UserAddComponent } from './user-add/user-add.component';
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

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css', '../../styles/styled.table.css']
})
export class UserComponent implements OnInit {
  dataTest = USER;
  @ViewChild(MatPaginator, { read: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<USER_TYPE>;


  displayedColumns: string[] = ['id', 'fullname', 'gender', 'updateby', 'updateat', 'email', 'other'];
  size = environment.pageSize;
  page = environment.currentPage;
  error: any;
  searchText: string = '';
  searchUpdate = new Subject<string>();
  currentPage = 0;
  rowClicked = -1;
  pageSizeOptions: number[] = environment.pageSizeOptions;
  dataSource = new MatTableDataSource<USER_TYPE>();
  pagingModel?: PaggingModel;
  template: Template = new Template()
  _filter: FilterTemplate = new FilterTemplate()


  constructor(
    private dialog: MatDialog,
    private userService: UserService,
    private navComponent: NavComponent,
    private confirmService: ConfirmService,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly translocoService: TranslocoService,
    private authenticationService: AuthenticationService) {

  }

  ngOnInit(): void {
    this.getAll();
  }


  OnNewDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';
    dialogConfig.data = new USER_TYPE();

    this.dialog
      .open(UserAddComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        this.getAll();
      });
  };

  OnEditDialog(user: USER_TYPE): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '750px';
    dialogConfig.data = user;

    this.dialog
      .open(UserAddComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        this.getAll();
      });
  };

  getAll() {
    this.navComponent._loading = true;
    this.userService.gets(this.page, this.size, this.searchText, this._filter).subscribe((res) => {
      const pagingModel = (res as ResponseModel).data;
      this.pagingModel = pagingModel;
      this.dataSource.data = (pagingModel as PaggingModel).result;
      this.changeDetectorRef.detectChanges();
      this.navComponent._loading = false;
    },
      (error) => {
        this.error = error;
        this.navComponent._loading = false;
      });
  }

  assignRole(user: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '600px';
    dialogConfig.data = user;
    const dialogRef = this.dialog.open(AssignRoleComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

      }
    });
  }

  editForm(user: USER_TYPE): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '750px';
    dialogConfig.data = user;

    const dialogRef = this.dialog.open(UserAddComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        console.log('Dialog result:', result);

      }
    });
  }

  deleteConfirm(user: USER_TYPE) {
    const options = {
      title: `${this.translocoService.translate('delete')} ${this.translocoService.translate('user')}`,
      message: `${this.translocoService.translate(
        'delete-confirmation'
      )} ${user.fullName}?`,
      cancelText: this.translocoService.translate('cancel'),
      confirmText: this.translocoService.translate('yes'),
    };

    this.confirmService.open(options);

    this.confirmService.confirmed().subscribe((confirmed) => {
      if (confirmed) {
        this.userService.delete(user.id).subscribe(
          (data) => {
            this.getAll();
          }
        );
      }
    });
  }
  pageChanged(event: PageEvent) {
    this.size = event.pageSize;
    this.page = event.pageIndex;
    this.getAll();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  checkAuth(roleName: string): boolean {
    return this.authenticationService.existAuthorization(roleName);
  }
}
