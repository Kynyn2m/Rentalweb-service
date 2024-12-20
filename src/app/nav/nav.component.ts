import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  AfterViewChecked,
  ViewChild,
  AfterViewInit,
  ElementRef,
  OnInit,
} from '@angular/core';
import { Observable } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';
import { ConfirmService } from '../components/confirm/confirm.service';
import { TranslocoService } from '@ngneat/transloco';
import { map, shareReplay, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ProfileService } from '../profile/profile.service';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements AfterViewChecked, AfterViewInit, OnInit {
  user: any = { fullName: '', profileUrl: '' };
  fullName: string | null = null;
  email: string | null = null;
  menuItems = [
    {
      router: '/home',
      icon: 'reorder',
      title: 'all',
      tooltip: 'home',
      adminOnly: false,
    },
    {
      router: '/room',
      icon: 'meeting_room',
      title: 'room',
      tooltip: 'room',
      adminOnly: false,
    },
    {
      router: '/house',
      icon: 'house',
      title: 'house',
      tooltip: 'house',
      adminOnly: false,
    },
    {
      router: '/land',
      icon: 'terrain',
      title: 'land',
      tooltip: 'land',
      adminOnly: false,
    },
    {
      router: '/add-post',
      icon: 'add',
      title: 'add-post',
      tooltip: 'add-post',
      adminOnly: false,
    },
    {
      router: '/contact',
      icon: 'contact_mail',
      title: 'contact',
      tooltip: 'contact',
      adminOnly: false,
    },

    // Admin-only menu items
    {
      router: '/dashboard',
      icon: 'dashboard',
      title: 'Dashboard',
      tooltip: 'Dashboard',
      adminOnly: true,
    },
    {
      router: '/house-list',
      icon: 'house',
      title: 'House',
      tooltip: 'house',
      adminOnly: true,
    },
    {
      router: '/room-list',
      icon: 'meeting_room',
      title: 'room',
      tooltip: 'room',
      adminOnly: true,
    },
    {
      router: '/land-list',
      icon: 'landscape',
      title: 'land',
      tooltip: 'land',
      adminOnly: true,
    },
    {
      router: '/user',
      icon: 'perm_identity',
      title: 'User',
      tooltip: 'User',
      adminOnly: true,
    },
    {
      router: '/role',
      icon: 'border_color',
      title: 'Role',
      tooltip: 'Role',
      adminOnly: true,
    },
    {
      router: '/comment',
      icon: 'comment',
      title: 'Comment',
      tooltip: 'Comment',
      adminOnly: true,
    },
  ];

  selectedItem: any = null;
  currentRouter?: string;
  fullRouter?: string;
  @Output() messageEvent = new EventEmitter<boolean>();
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('sidenavContent', { read: ElementRef })
  sidenavContent!: ElementRef;
  animationClass = 'animate__animated animate__fadeIn';

  isMediumScreen$: Observable<boolean> = this.breakpointObserver
    .observe(['(max-width: 1104px)'])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  public collapsed: boolean = true;
  public dropdown: boolean = true;
  public menuOpen: boolean = false;
  _loading: boolean = false;
  _theme: string = 'default';
  _fontSize: string = 'medium';
  isAdmin: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private breakpointObserver: BreakpointObserver,
    private confirmService: ConfirmService,
    private transloco: TranslocoService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private profileService: ProfileService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.initializeSettings();
    this.checkUserRole();
  }

  ngAfterViewInit(): void {
    this.isMediumScreen$.subscribe((isMediumScreen) => {
      if (this.sidenav) {
        if (!isMediumScreen && this.sidenav.opened) {
          this.sidenav.close();
        }
      }
    });

    this.router.events.subscribe((event) => {
      // if (event instanceof NavigationStart) {
      //   this.animationClass = 'animate__animated animate__fadeOut';
      // }
      // if (event instanceof NavigationEnd) {
      //   setTimeout(() => {
      //     this.animationClass = 'animate__animated animate__fadeIn';
      //     this.scrollToTop();
      //   }, 0);
      // }
    });
  }
  ngOnInit(): void {
    const loggedIn = this.isLoggedIn;
    this.authenticationService.currentUser
      .pipe(
        tap((user) => {
          this.isAdmin = user?.id === 0; // Set isAdmin based on user.id
        })
      )
      .subscribe();
    if (this.isLoggedIn) {
      this.loadUserProfile();
    }
  }

  checkUserRole(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    // Check if the user's ID is 0 (Admin)
    this.isAdmin = currentUser && currentUser.id === 0;
  }

  private scrollToTop(): void {
    if (this.sidenavContent && this.sidenavContent.nativeElement) {
      this.sidenavContent.nativeElement.scrollTop = 0;
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
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

    this.confirmService.open(options);
    this.confirmService.confirmed().subscribe((confirmed) => {
      if (confirmed) {
        this.authenticationService.logout();
        this.messageEvent.emit(false);
        // this.router.navigate(['/login']);
        window.location.reload(); // Reload the page after logout
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.fullRouter !== this.router.url) {
      this.currentRouter = this.router.url.split('/')[1];
      this.fullRouter = this.router.url;
      this.cdr.detectChanges();
    }
  }

  onCollapse(): void {
    this.collapsed = !this.collapsed;
    localStorage.setItem('isCollapsed', String(this.collapsed));
  }

  onDropdown(): void {
    this.dropdown = !this.dropdown;
    localStorage.setItem('isDropdowned', String(this.dropdown));
  }

  prepareRoute(outlet: RouterOutlet): boolean | string {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }
  selectItem(item: any) {
    this.selectedItem = item;
  }
  get isLoggedIn(): boolean {
    return !!this.authenticationService.currentUserValue?.token;
  }
  loadUserProfile(): void {
    this.profileService.getProfile().subscribe(
      (response) => {
        if (response.code === 200) {
          this.fullName = response.result.fullName;
          this.email = response.result.email;
          this.user.profileUrl = response.result.profileUrl;
        }
      },
      (error) => {
        console.error('Error fetching profile data', error);
      }
    );
  }
  openChangePasswordDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '450px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Password was successfully changed.');
      }
    });
  }
}
