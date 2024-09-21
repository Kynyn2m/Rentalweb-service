import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Ensure the user exists and check for 'user' role
    if (currentUser && currentUser.role === 'user') {
      return true;  // Allow access if the user is a regular user
    }

    // If the user is not a regular user, redirect them to login or home
    this.router.navigate(['/login']);
    return false;
  }
}
