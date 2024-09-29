import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NonAdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // If the user is an admin (id = 0), block them from accessing non-admin routes
    if (currentUser && currentUser.id === 0) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    // Allow access to non-admin users
    return true;
  }
}
