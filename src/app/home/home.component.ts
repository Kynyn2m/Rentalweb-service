import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  gridCols = 4; // Default to 4 columns

  // Banner images
  banners: string[] = [
    '../../assets/homepage/h1r.jpg',
    '../../assets/homepage/h1r.jpg',
  ];
  currentBannerIndex: number = 0;

  // Rooms data
  rooms = [
    {
      title: 'Room 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$100',
      images: ['../../assets/room/r1.jpg', '../../assets/room/r1.jpg'],
      currentImageIndex: 0,
    },
    {
      title: 'Room 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$100',
      images: ['../../assets/room/r4.jpg', '../../assets/room/r1.jpg'],
      currentImageIndex: 0,
    },
    {
      title: 'Room 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$100',
      images: ['../../assets/room/r3.jpg', '../../assets/room/r1.jpg'],
      currentImageIndex: 0,
    },
    {
      title: 'Room 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$100',
      images: ['../../assets/room/r2.jpg', '../../assets/room/r2.jpg'],
      currentImageIndex: 0,
    },
    // Additional rooms can be added here...
  ];

  // Houses data
  houses = [
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h1.jpeg', '../../assets/house/h1.jpeg'],
      currentImageIndex: 0,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h4.jpg', '../../assets/house/h1.jpeg'],
      currentImageIndex: 0,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h3.jpg', '../../assets/house/h1.jpeg'],
      currentImageIndex: 0,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h2.jpg', '../../assets/house/h1.jpeg'],
      currentImageIndex: 0,
    },
    // Additional houses can be added here...
  ];

  // Lands data
  lands = [
    {
      title: 'Land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$300',
      images: ['../../assets/land/L1.jpg', '../../assets/land/L1.jpg'],
      currentImageIndex: 0,
    },
    {
      title: 'Land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$300',
      images: ['../../assets/land/L4.jpg', '../../assets/land/L1.jpg'],
      currentImageIndex: 0,
    },
    {
      title: 'Land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$300',
      images: ['../../assets/land/L3.jpg', '../../assets/land/L1.jpg'],
      currentImageIndex: 0,
    },
    {
      title: 'Land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$300',
      images: ['../../assets/land/L2.jpg', '../../assets/land/L1.jpg'],
      currentImageIndex: 0,
    },
    // Additional lands can be added here...
  ];

  constructor(private breakpointObserver: BreakpointObserver) {
    this.initializeGridCols();
  }

  // Get the current banner to display
  get currentBanner(): string {
    return this.banners[this.currentBannerIndex];
  }

  // Navigate to the next banner
  nextBanner(): void {
    this.currentBannerIndex =
      (this.currentBannerIndex + 1) % this.banners.length;
  }

  // Navigate to the previous banner
  prevBanner(): void {
    this.currentBannerIndex =
      (this.currentBannerIndex - 1 + this.banners.length) % this.banners.length;
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
