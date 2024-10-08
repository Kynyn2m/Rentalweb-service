import { Component } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  totalUsers: number = 0;
  totalRoom: number = 0;
  totalLand: number = 0;
  totalHouse: number = 0;
  totalPost: number = 0;

  constructor(
    private readonly dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe(
      (response) => {
        if (response.code === 200) {
          const result = response.result;
          this.totalUsers = result.totalUser;
          this.totalRoom = result.totalRoom;
          this.totalLand = result.totalLand;
          this.totalHouse = result.totalHouse;
          this.totalPost = result.totalPost;
        }
      },
      (error) => {
        console.error('Error fetching dashboard data:', error);
      }
    );
  }
  goToHouseList(): void {
    this.router.navigate(['/house-list']);
  }
  goToRoomList(): void {
    this.router.navigate(['/room-list']);
  }
}
