import { Injectable } from '@angular/core';
import { HouseService } from 'src/app/Service/house.service';
import { BehaviorSubject, Observable } from 'rxjs';

import { House } from '../house-list/house-list.component';

@Injectable({
  providedIn: 'root',
})
export class DashboardDataService {
  loading$ = new BehaviorSubject<boolean>(false);
  private housesSubject = new BehaviorSubject<House[]>([]);
  public houses$ = this.housesSubject.asObservable();
  public postsByWeek: { week: string; posts: number }[] = [];

  constructor(private houseService: HouseService) {}

  // Fetch houses data from the server
  fetchHouses(page: number = 0, size: number = 10, search: string = ''): void {
    const params = { page, size, search };

    this.houseService.getHouses(params).subscribe(
      (response) => {
        if (response.code === 200) {
          const houses = response.result.result as House[];

          // Update houses data
          this.housesSubject.next(houses);

          // Calculate posts per week
          this.postsByWeek = this.getPostsByWeek(houses);

          // Call method to update the chart
          this.updateChartData();
        }
      },
      (error) => {
        console.error('Error fetching house data', error);
      }
    );
  }

  // Calculate the number of posts per week for the dashboard
  getPostsByWeek(houses: House[]): { week: string; posts: number }[] {
    const postsByWeek: { week: string; posts: number }[] = [];

    houses.forEach((house) => {
      const createdAt = new Date(house.createdAt); // Convert createdAt to Date object
      const weekNumber = this.getWeekNumber(createdAt); // Get the week number

      // Find existing week or add a new entry
      const existingWeek = postsByWeek.find((item) => item.week === weekNumber);
      if (existingWeek) {
        existingWeek.posts += 1;
      } else {
        postsByWeek.push({ week: weekNumber, posts: 1 });
      }
    });

    return postsByWeek;
  }

  // Helper method to calculate the ISO week number from a date
  private getWeekNumber(date: Date): string {
    const startDate = new Date(date.getFullYear(), 0, 1); // Start of the year
    const diff = date.getTime() - startDate.getTime();
    const oneDay = 1000 * 60 * 60 * 24; // One day in milliseconds
    const dayOfYear = Math.floor(diff / oneDay); // Calculate day of year
    const weekNumber = Math.ceil((dayOfYear + 1) / 7); // Calculate week number
    return `Week ${weekNumber}`;
  }

  // Update chart data based on posts per week
  updateChartData(): void {
    const chartData = {
      labels: this.postsByWeek.map((item) => item.week),
      datasets: [
        {
          label: 'Posts per Week',
          data: this.postsByWeek.map((item) => item.posts),
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          borderWidth: 1,
        },
      ],
    };

    // Now update the chart with the new data
    console.log('Updated chart data:', chartData);
    // If you're using a charting library, you should update the chart here
    // For example:
    // this.chart.update(chartData);
  }
}
