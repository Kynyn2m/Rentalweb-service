import { Component, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { Router } from '@angular/router';
import { ChartOptions } from 'chart.js';
import { House, HouseListComponent } from './house-list/house-list.component';
import { HouseDataService } from './house-list/HouseDataService';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  // Data for the chart
  chartData: any;
  chartOptions: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };


  totalUsers: number = 0;
  totalRoom: number = 0;
  totalLand: number = 0;
  totalHouse: number = 0;
  totalPost: number = 0;

  selectedMonth: number = 5; // May
  selectedYear: number = 2024; // Example year

  constructor(
    private readonly dashboardService: DashboardService,
    private router: Router,
    private houseDataService: HouseDataService
  ) {}

  ngOnInit(): void {
    this.fetchDashboardData();
    this.fetchhouseData();
    this.chartData = {
      labels: [],
      datasets: [
        {
          data: [],
          label: 'Posts per Month',
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          borderWidth: 1,
        },
      ],
    };
  }

  fetchhouseData(): void {
    const params = {
      page: 0,
      size: 10,
      search: '',
    };

    // Get house data
    this.houseDataService.getHouses(params).subscribe(
      (response) => {
        if (response.code === 200) {
          const houses: House[] = response.result.result;

          // Get posts grouped by week in the selected month and year
          const weeklyPostData = this.houseDataService.getPostsByWeek(houses, this.selectedMonth, this.selectedYear);

          // Log the weeklyPostData to verify the structure
          console.log("Weekly Post Data for Chart: ", weeklyPostData);

          // Extract weeks and post counts from the data
          const labels = weeklyPostData.map(item => item.week);  // Get week labels (e.g., "Week 1", "Week 2")
          const data = weeklyPostData.map(item => item.posts);   // Get the number of posts for each week

          // Set up chart data
          this.chartData = {
            labels: labels, // Set weeks as chart labels
            datasets: [
              {
                data: data, // Set post counts for each week
                label: 'Posts per Week',
                backgroundColor: '#42A5F5',
                borderColor: '#1E88E5',
                borderWidth: 1,
              },
            ],
          };
        }
      },
      (error) => {
        console.error('Error fetching house data', error);
      }
    );
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

          // Update chart data dynamically after fetching data
          this.updateChartData();
        }
      },
      (error) => {
        console.error('Error fetching dashboard data:', error);
      }
    );
  }

  updateChartData(): void {
    this.chartData.datasets[0].data = [
      this.totalUsers,
      this.totalRoom,
      this.totalLand,
      this.totalHouse,
      this.totalPost,
    ];
  }

  // Navigation functions
  goToHouseList(): void {
    this.router.navigate(['/house-list']);
  }

  goToRoomList(): void {
    this.router.navigate(['/room-list']);
  }

  goToLandList(): void {
    this.router.navigate(['/land-list']);
  }

  goToUser(): void {
    this.router.navigate(['/user']);
  }
}
