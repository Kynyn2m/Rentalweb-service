import { Component } from '@angular/core';
import { AuthenticationService } from './authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'QR-attendance';
  isAuth: boolean = true;

  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    // this.isAuth = this.authenticationService.currentUserValue?.token != null;
  }

  receiveMessage($event: boolean) {
    this.isAuth = $event
  }
}
