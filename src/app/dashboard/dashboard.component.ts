import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  totalUsers = 500;
  totalProperties = 120;
  newMessages = 10;
  totalBookings = 85;

  recentActivities = [
    { activity: 'User John booked a property', timestamp: '2024-09-21 10:00' },
    { activity: 'Property Listing Updated', timestamp: '2024-09-20 16:30' }
  ];

  properties = [
    { name: 'Villa Sunset', location: 'California', price: 2000, status: 'Available' },
    { name: 'City Apartment', location: 'New York', price: 1500, status: 'Booked' }
  ];

  displayedColumns: string[] = ['name', 'location', 'price', 'status'];
}
