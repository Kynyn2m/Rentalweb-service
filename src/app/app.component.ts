import { Component, Injectable } from '@angular/core';
import { AuthenticationService } from './authentication/authentication.service';
import { NavService } from './nav/nav.service';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Rental Web Service';
  public isAuth: boolean = false; // Initialize isAuth to false

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
  }

  // This will receive updates from the login component or other components
  receiveMessage($event: boolean) {
    this.isAuth = $event;
  }
  get isLoggedIn(): boolean {
    return !!this.authenticationService.currentUserValue?.token;
  }
}
