import { Component, OnInit } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { Router } from '@angular/router';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import { HouseService } from '../Service/house.service';
import { LandService } from '../add-post/add-post-land/land.service';
import { RoomService } from '../Service/room.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

  postsByWeek: { week: string; posts: number }[] = [];


  totalUsers: number = 0;
  totalRoom: number = 0;
  totalLand: number = 0;
  totalHouse: number = 0;
  totalPost: number = 0;

  houseChartData: ChartData = {
    datasets: []
  };
  roomChartData: ChartData = {
    datasets: []
  };
  landChartData: ChartData = {
    datasets: []
  };
  totalDataChart: ChartData = {
    datasets: []
  }; // New chart data for total values
  chartOptions: any;

  constructor(
    private readonly dashboardService: DashboardService,
    private router: Router,
    private houseService: HouseService,
    private roomService: RoomService,
    private landService: LandService
  ) {}

  ngOnInit(): void {
    this.fetchDashboardData();

    this.totalDataChart = {
      labels: ['Users', 'Rooms', 'Lands', 'Houses', 'Posts'],
      datasets: [
        {
          label: 'Total Count',
          data: [this.totalUsers, this.totalRoom, this.totalLand, this.totalHouse, this.totalPost],
          backgroundColor: ['#ff7043', '#26a69a', '#4caf50', '#ffca28', '#1e88e5'],
          borderColor: ['#ff7043', '#26a69a', '#4caf50', '#ffca28', '#1e88e5'],
          borderWidth: 1
        }
      ]
    };

    // Fetching house data
    this.houseService.getHouses().subscribe(response => {
      console.log('House Data:', response.result);  // Log the result object for houses
      const houses = response.result.result; // Assuming houses are under result.result
      const postsByDay = this.getPostsByDay(houses);
      this.updateChartData(postsByDay, 'house');
    }, error => {
      console.error('Error fetching houses:', error);
    });

    // Fetching room data
    this.roomService.getRooms().subscribe(response => {
      console.log('Room Data:', response.result);  // Log the result object for rooms
      const rooms = response.result.result; // Assuming rooms are under result.result
      const postsByDay = this.getPostsByDay(rooms);
      this.updateChartData(postsByDay, 'room');
    }, error => {
      console.error('Error fetching rooms:', error);
    });

    // Fetching land data
    this.landService.getLand().subscribe(response => {
      console.log('Land Data:', response.result);  // Log the result object for lands
      const lands = response.result.result; // Assuming lands are under result.result
      const postsByDay = this.getPostsByDay(lands);
      this.updateChartData(postsByDay, 'land');
    }, error => {
      console.error('Error fetching lands:', error);
    });
  }


  getPostsByDay(posts: any[]): any {
    let dayCounts: { [key: string]: number } = {};

    posts.forEach(post => {
      const createdDate = new Date(post.createdAt);
      const year = createdDate.getFullYear();
      const month = createdDate.getMonth() + 1;
      const day = createdDate.getDate();

      const dateKey = `${year}-${this.padZero(month)}-${this.padZero(day)}`;
      dayCounts[dateKey] = (dayCounts[dateKey] || 0) + 1;
    });

    const sortedDateKeys = Object.keys(dayCounts).sort();
    const dateLabels = sortedDateKeys;
    const dateValues = sortedDateKeys.map(key => dayCounts[key]);

    return {
      labels: dateLabels,
      values: dateValues
    };
  }

  padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  updateChartData(postsByDay: any, type: string): void {
    const chartData: ChartData = {
      labels: postsByDay.labels,
      datasets: [
        {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Posts Each Day`,
          data: postsByDay.values,
          backgroundColor: type === 'house' ? 'rgba(0, 123, 255, 0.6)' :
                            type === 'room' ? 'rgba(75, 192, 192, 0.6)' :
                            'rgba(255, 99, 132, 0.6)',
          borderColor: type === 'house' ? 'rgba(0, 123, 255, 1)' :
                       type === 'room' ? 'rgba(75, 192, 192, 1)' :
                       'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    if (type === 'house') {
      this.houseChartData = chartData;
    } else if (type === 'room') {
      this.roomChartData = chartData;
    } else if (type === 'land') {
      this.landChartData = chartData;
    }
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

          // After getting the data, update the chart
          this.updateTotalDataChart();
        }
      },
      (error) => {
        console.error('Error fetching dashboard data:', error);
      }
    );
  }

  updateTotalDataChart(): void {
    this.totalDataChart = {
      labels: ['Users', 'Rooms', 'Lands', 'Houses', 'Posts'],
      datasets: [
        {
          label: 'Total Count',
          data: [this.totalUsers, this.totalRoom, this.totalLand, this.totalHouse, this.totalPost],
          backgroundColor: ['#ff7043', '#26a69a', '#4caf50', '#ffca28', '#1e88e5'],
          borderColor: ['#ff7043', '#26a69a', '#4caf50', '#ffca28', '#1e88e5'],
          borderWidth: 1
        }
      ]
    };
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
