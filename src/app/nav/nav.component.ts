import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  AfterViewChecked,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { Observable } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { ConfirmService } from '../components/confirm/confirm.service';
import { TranslocoService } from '@ngneat/transloco';
import { map, shareReplay } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ThemeComponent } from '../components/theme/theme.component';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements AfterViewChecked, AfterViewInit {
  currentRouter?: string;
  fullRouter?: string;
  @Output() messageEvent = new EventEmitter<boolean>();
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  public collapsed: boolean = true;
  public dropdown: boolean = true;
  _loading: boolean = false;
  _theme: string = 'default';
  _fontSize: string = 'medium';

  constructor(
    private authenticationService: AuthenticationService,
    private breakpointObserver: BreakpointObserver,
    private confirmService: ConfirmService,
    private transloco: TranslocoService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.initializeSettings();
  }

  ngAfterViewInit(): void {
    this.isHandset$.subscribe((isHandset) => {
      if (this.sidenav) {
        if (!isHandset && this.sidenav.opened) {
          this.sidenav.close();
        }
      }
    });
  }

  private initializeSettings(): void {
    this._theme = localStorage.getItem('theme') || this._theme;
    this._fontSize = localStorage.getItem('font-size') || this._fontSize;
    this.collapsed = localStorage.getItem('isCollapsed') !== 'false';
    this.dropdown = localStorage.getItem('isDropdowned') !== 'false';
  }

  logout(): void {
    const options = {
      title: this.transloco.translate('logout'),
      message: this.transloco.translate('logout-confirm'),
      cancelText: this.transloco.translate('cancel'),
      confirmText: this.transloco.translate('yes'),
    };

    // this.confirmService
    //   .open(options)
    //   .afterClosed()
    //   .subscribe((confirmed) => {
    //     if (confirmed) {
    //       this.authenticationService.logout();
    //       this.messageEvent.emit(false);
    //       this.router.navigate(['/login']);
    //     }
    //   });
  }

  ngAfterViewChecked(): void {
    if (this.fullRouter !== this.router.url) {
      this.currentRouter = this.router.url.split('/')[1];
      this.fullRouter = this.router.url;
      this.cdr.detectChanges();
    }
  }

  OnCollapse(): void {
    this.collapsed = !this.collapsed;
    localStorage.setItem('isCollapsed', String(this.collapsed));
  }

  onDropdown(): void {
    this.dropdown = !this.dropdown;
    localStorage.setItem('isDropdowned', String(this.dropdown));
  }
}
