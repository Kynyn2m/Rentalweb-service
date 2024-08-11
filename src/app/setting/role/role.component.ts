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

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css', '../../styles/styled.table.css']
})
export class RoleComponent implements AfterViewInit, OnInit {
  dataTest = ROLE;
  @ViewChild(MatPaginator, { read: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<ROLE_TYPE>;
  pagingModel?: PaggingModel;
  searchText: string = '';
  searchUpdate = new Subject<string>();
  currentPage = 0;
  error = '';
  rowClicked = -1;
  displayedColumns = ['id', 'name', 'description', 'updateBy', 'updateAt', 'other'];
  dataSource = new MatTableDataSource<ROLE_TYPE>();
  page = environment.currentPage;
  size = environment.pageSize;
  pageSizeOptions: number[] = environment.pageSizeOptions;
  _filter: FilterTemplate = new FilterTemplate()

  constructor(
    public dialog: MatDialog,
    private roleService: RoleService,
    private navComponent: NavComponent,
    private confirmService: ConfirmService,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly translocoService: TranslocoService,
    private authenticationService: AuthenticationService
  ) { }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    // this.table.dataSource = this.dataSource;
  }

  ngOnInit(): void {
    this.getAll();
  }

  changeTableRowColor(idx: any) {
    this.rowClicked = idx;
  }

  exist(permission_name: string): boolean {
    return PermissionData.exist(permission_name);
  }

  getAll() {
    this.navComponent._loading = true;
    this.roleService.gets(this.page, this.size, this.searchText, this._filter).subscribe((res) => {
      const pagingModel = (res as ResponseModel).data;
      this.pagingModel = pagingModel;
      console.log("resr:::", res);
      console.log("ddddddddddd:::", pagingModel.result);

      this.dataSource.data = (pagingModel as PaggingModel).result;
      this.changeDetectorRef.detectChanges();
      this.navComponent._loading = false;
    },
      (error) => {
        this.error = error;
      });
  }

  newDailog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = new ROLE_TYPE();

    this.dialog
      .open(AddRoleDesComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        this.getAll();
      });
  }

  updateDailog(role: ROLE_TYPE) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = role;

    this.dialog
      .open(AddRoleDesComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        this.getAll();
      });
  }

  deleteConfirm(role: ROLE_TYPE) {
    const options = {
      title: `${this.translocoService.translate('delete')} ${this.translocoService.translate('role')}`,
      message: `${this.translocoService.translate('delete-confirmation')} ${this.translocoService.translate('role')} ${role.name}?`,
      cancelText: this.translocoService.translate('cancel'),
      confirmText: this.translocoService.translate('yes'),
    };

    this.confirmService.open(options);

    this.confirmService.confirmed().subscribe((confirmed) => {
      if (confirmed) {
        this.roleService.delete(role.id).subscribe(
          (data) => {
            this.getAll();
          },
          (error) => { }
        );
      }
    });
  }

  updatePermission(role: ROLE_TYPE) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = role;

    this.dialog
      .open(PermissionComponent, dialogConfig)
      .afterClosed()
      .subscribe((result) => {
        this.getAll();
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
