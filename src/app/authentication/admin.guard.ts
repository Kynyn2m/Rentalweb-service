import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Check if the user's ID is 0 (Admin)
    if (currentUser && currentUser.id === 0) {
      return true;  // Allow access if the user is admin
    }

    // Redirect to home if not admin
    this.router.navigate(['/login']);
    return false;
  }
}
