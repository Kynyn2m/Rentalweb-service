import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HouseService } from 'src/app/Service/house.service';
import { House } from './house-list.component';

@Injectable({
  providedIn: 'root',
})
export class HouseDataService {
  constructor(private houseService: HouseService) {}

  // Fetch house data from the server
  getHouses(params: any): Observable<any> {
    return this.houseService.getHouses(params);
  }

  getWeekNumber(date: Date): number {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - startDate.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return Math.ceil((dayOfYear + 1) / 7);
  }

  // Group houses by week
  getPostsByWeek(houses: House[], selectedMonth: number, selectedYear: number): { week: string, posts: number }[] {
    const weeklyData: { [key: string]: number } = {};

    houses.forEach(house => {
      const createdAt = new Date(house.createdAt);
      const month = createdAt.getMonth() + 1; // Months are zero-indexed, so we add 1
      const year = createdAt.getFullYear();

      // Filter by the selected month and year
      if (month === selectedMonth && year === selectedYear) {
        const weekNumber = this.getWeekNumber(createdAt); // Get the week number for the house's creation date
        const weekLabel = `Week ${weekNumber} - ${year}`;

        if (weeklyData[weekLabel]) {
          weeklyData[weekLabel]++;
        } else {
          weeklyData[weekLabel] = 1;
        }
      }
    });

    // Log the weekly data to check
    console.log("Weekly Post Data: ", weeklyData);

    // Convert the object to an array of { week: string, posts: number }
    return Object.keys(weeklyData).map(key => ({
      week: key,
      posts: weeklyData[key],
    }));
  }

}
