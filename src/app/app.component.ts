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
  title = 'rental-web-serivce';
  isAuth: boolean = true;
  animationClass = 'animate__animated animate__fadeIn';

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    const token = localStorage.getItem('currentUser');
    if (token == null) {
      this.isAuth = false;
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/home']);
    }
    console.log(token, 'ffff');
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.animationClass = 'animate__animated animate__fadeOut';
      }
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          this.animationClass = 'animate__animated animate__fadeIn';
        }, 0);
      }
    });
  }

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
