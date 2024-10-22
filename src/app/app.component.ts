import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from './authentication/authentication.service';
import { NavService } from './nav/nav.service';
import { NavComponent } from './nav/nav.component';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit  {
  @ViewChild(NavComponent) navComponent!: NavComponent;

  title = 'Rental Web Service';
  public isAuth: boolean = false;
  isAdmin = false;

  constructor(
    private authenticationService: AuthenticationService,
    private readonly navService: NavService,
  ) {
    // Subscribe to authEmitter in navService to track authentication state
    this.navService.authEmitter.subscribe((isEmitterAuth: boolean) => {
      this.isAuth = isEmitterAuth;
    });
  }

  ngOnInit(): void {
    // Set isAuth based on whether there is a valid token in the currentUser
    this.isAuth = !!this.authenticationService.currentUserValue?.token;
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (currentUser && currentUser.id !== undefined) {
      // Check if the user's ID is 0 (Admin)
      this.isAdmin = currentUser.id === 0;
    }
  }
  Onscroll(): void{
    window.scrollTo(0, 0 ,);
  }

  // This will receive updates from the login component or other components
  receiveMessage($event: boolean) {
    this.isAuth = $event;
  }
  get isLoggedIn(): boolean {
    return !!this.authenticationService.currentUserValue?.token;
  }
}
