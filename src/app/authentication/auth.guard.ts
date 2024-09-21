import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Check if the currentUser exists and has the role 'admin'
    if (currentUser && currentUser.role === 'admin') {
      return true;  // Allow access for admin users
    }

    // Redirect to login page if the user is not an admin
    this.router.navigate(['/login']);
    return false;
  }
}
