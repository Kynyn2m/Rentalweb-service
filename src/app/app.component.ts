import { Component, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from './authentication/authentication.service';
import { NavService } from './nav/nav.service';
import { NavComponent } from './nav/nav.component';
import { AdDialogComponent } from './ad-dialog/ad-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from './ad-dialog/AuthService';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private adDialogShown: boolean = false;
  @Input() adminOnly: boolean = false;
  @ViewChild(NavComponent) navComponent!: NavComponent;
  showOverlay: boolean = false; // Controls overlay visibility
  remainingTime: number = 5; // Countdown timer for the overlay

  title = 'Rental Web Service';
  public isAuth: boolean = false;
  isAdmin = false;

  constructor(
    private authenticationService: AuthenticationService,
    private readonly navService: NavService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
  ) {
    // Subscribe to authEmitter in navService to track authentication state
    this.navService.authEmitter.subscribe((isEmitterAuth: boolean) => {
      this.isAuth = isEmitterAuth;
    });
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Show ad dialog on "home" route if user is not logged in
        if (event.url === '/home' && !this.authService.getLoginStatus()) {
          this.showAdDialogWithDelay();
        }
      }
    });
    // Set isAuth based on whether there is a valid token in the currentUser
    this.isAuth = !!this.authenticationService.currentUserValue?.token;
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (currentUser && currentUser.id !== undefined) {
      // Check if the user's ID is 0 (Admin)
      this.isAdmin = currentUser.id === 0;
    }
  }

  private showAdDialogWithDelay(): void {
    const lastAdTimestamp = localStorage.getItem('lastAdTimestamp');
    const currentTime = new Date().getTime();
    const threeMinutes = 3 * 60 * 1000; // 3 minutes in milliseconds

    // Show the ad if no timestamp exists or if 3 minutes have passed
    if (!lastAdTimestamp || currentTime - parseInt(lastAdTimestamp, 10) > threeMinutes) {
      this.adDialogShown = true; // Prevent multiple dialogs in the same session
      setTimeout(() => {
        this.dialog.open(AdDialogComponent, {
          disableClose: true, // Prevent closing outside the dialog
        }).afterClosed().subscribe(() => {
          this.adDialogShown = false; // Allow showing the ad again in future sessions
          localStorage.setItem('lastAdTimestamp', currentTime.toString()); // Update timestamp
        });
      }, 4000); // Show the ad dialog after 4 seconds
    }
  }



  Onscroll(): void {
    window.scrollTo(0, 0);
  }

  // This will receive updates from the login component or other components
  receiveMessage($event: boolean) {
    this.isAuth = $event;
  }
  get isLoggedIn(): boolean {
    return !!this.authenticationService.currentUserValue?.token;
  }
}
