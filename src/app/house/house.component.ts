import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';

@Component({
  selector: 'app-house',
  templateUrl: './house.component.html',
  styleUrls: ['./house.component.css'],
})
export class HouseComponent {
  gridCols = 4; // Default to 4 columns
  banners: string[] = [
    'https://via.placeholder.com/600x200.png?text=Banner+1',
    'https://via.placeholder.com/600x200.png?text=Banner+2',
  ];

  // Houses data
  houses = [
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: [
        'https://via.placeholder.com/300x200.png?text=House+1',
        'https://via.placeholder.com/300x200.png?text=House+1+Alt',
      ],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    // Additional houses can be added here...
  ];

  constructor(private breakpointObserver: BreakpointObserver) {
    this.initializeGridCols();
  }

  // Navigate to the next image in a card
  nextImage(item: any): void {
    item.currentImageIndex = (item.currentImageIndex + 1) % item.images.length;
  }

  // Navigate to the previous image in a card
  prevImage(item: any): void {
    item.currentImageIndex =
      (item.currentImageIndex - 1 + item.images.length) % item.images.length;
  }

  // Initialize the grid columns based on the screen size
  private initializeGridCols(): void {
    const breakpoints = [
      { query: Breakpoints.HandsetPortrait, cols: 1 },
      { query: Breakpoints.HandsetLandscape, cols: 2 },
      { query: Breakpoints.TabletPortrait, cols: 2 },
      { query: Breakpoints.TabletLandscape, cols: 3 },
      { query: Breakpoints.WebPortrait, cols: 3 },
      { query: Breakpoints.WebLandscape, cols: 4 },
    ];

    this.breakpointObserver
      .observe(breakpoints.map((bp) => bp.query))
      .subscribe((result) => {
        for (let bp of breakpoints) {
          if (result.breakpoints[bp.query]) {
            this.gridCols = bp.cols;
            break;
          }
        }
      });
  }
}
