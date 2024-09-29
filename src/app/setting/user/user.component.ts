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

  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '750px';
    dialogConfig.data = new USER_TYPE();

    this.dialog
      .open(UserFormComponent, dialogConfig)
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
}
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}
/** Builds and returns a new User. */
const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
  { position: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na' },
  { position: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg' },
  { position: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al' },
  { position: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si' },
  { position: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P' },
  { position: 16, name: 'Sulfur', weight: 32.065, symbol: 'S' },
  { position: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl' },
  { position: 18, name: 'Argon', weight: 39.948, symbol: 'Ar' },
  { position: 19, name: 'Potassium', weight: 39.0983, symbol: 'K' },
  { position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca' },
];
