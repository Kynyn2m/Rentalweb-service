import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './authentication/authentication.service';
import {
  Router,
  NavigationEnd,
  NavigationStart,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'rental-web-service';
  isAuth: boolean = true;
  animationClass = 'animate__animated animate__fadeIn';

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    this.checkAuthentication();
  }

  ngOnInit() {
    this.handleRouteAnimations();
    // this.restoreLastRoute();
  }

  private checkAuthentication() {
    const token = localStorage.getItem('currentUser');
    if (!token) {
      this.isAuth = false;
      this.router.navigate(['/login']);
    } else {
      this.isAuth = true;
    }
    console.log(token, 'User token retrieved');
  }

  private handleRouteAnimations() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.animationClass = 'animate__animated animate__fadeOut';
      }
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          this.animationClass = 'animate__animated animate__fadeIn';
          // Store the last route in localStorage
          // localStorage.setItem('lastRoute', event.urlAfterRedirects);
        }, 0);
      }
    });
  }

  // private restoreLastRoute() {
  //   const lastRoute = localStorage.getItem('lastRoute');
  //   if (lastRoute && lastRoute !== '/login') {
  //     this.router.navigateByUrl(lastRoute);
  //   }
  // }

  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }

  receiveMessage($event: boolean) {
    this.isAuth = $event;
  }
}
