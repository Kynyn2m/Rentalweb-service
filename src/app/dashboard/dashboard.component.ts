import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Fake data for dashboard statistics
  totalUsers = 128;
  totalProperties = 76;
  newMessages = 15;
  totalBookings = 45;

  // Fake recent activities data
  recentActivities = [
    { activity: 'New user registered: John Doe', timestamp: '2023-09-21 12:45' },
    { activity: 'New property listed: Ocean View Apartment', timestamp: '2023-09-20 15:30' },
    { activity: 'Booking confirmed for: Luxury Villa', timestamp: '2023-09-20 10:15' },
    { activity: 'Message received from: Jane Smith', timestamp: '2023-09-19 17:25' },
    { activity: 'Property removed: City Center Apartment', timestamp: '2023-09-18 14:50' },
  ];

  // Fake properties data
  properties = [
    { name: 'Ocean View Apartment', location: 'Miami Beach', price: 1200, status: 'Available' },
    { name: 'Luxury Villa', location: 'Los Angeles', price: 2500, status: 'Booked' },
    { name: 'City Center Apartment', location: 'New York', price: 1800, status: 'Available' },
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialization logic if needed
  }
}
