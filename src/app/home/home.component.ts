import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  gridCols = 4; // Default to 4 columns

  // Banner images
  banners: string[] = [
    '../../assets/ads&baner/Thesis.jpg',
    '../../assets/homepage/h1r.jpg',
  ];
  currentBannerIndex: number = 0;

  // Rooms data
  rooms = [
    {
      id: 1,
      title: 'Room 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$100',
      images: ['../../assets/room/r1.jpg', '../../assets/room/r1.jpg'],
      currentImageIndex: 0,
    },
    {
      id: 2,
      title: 'Room 2',
      location: 'Location 1',
      contact: '1234567890',
      price: '$100',
      images: ['../../assets/room/r4.jpg', '../../assets/room/r1.jpg'],
      currentImageIndex: 0,
    },
    {
      id: 3,
      title: 'Room 3',
      location: 'Location 1',
      contact: '1234567890',
      price: '$100',
      images: ['../../assets/room/r3.jpg', '../../assets/room/r1.jpg'],
      currentImageIndex: 0,
    },
    {
      id: 4,
      title: 'Room 4',
      location: 'Location 1',
      contact: '1234567890',
      price: '$100',
      images: ['../../assets/room/r2.jpg', '../../assets/room/r2.jpg'],
      currentImageIndex: 0,
    },
    // Additional rooms can be added here...
  ];

  houses = [
    {
      id: 1,
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h1.jpeg', '../../assets/house/h1.jpeg'],
      currentImageIndex: 0,
    },
    {
      id: 2,
      title: 'House 2',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h4.jpg', '../../assets/house/h1.jpeg'],
      currentImageIndex: 0,
    },
    {
      id: 3,
      title: 'House 3',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h3.jpg', '../../assets/house/h1.jpeg'],
      currentImageIndex: 0,
    },
    {
      id: 4,
      title: 'House 4',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h2.jpg', '../../assets/house/h1.jpeg'],
      currentImageIndex: 0,
    },
    // Additional houses can be added here...
  ];

  lands = [
    {
      id: 1,
      title: 'Land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$300',
      images: ['../../assets/land/L1.jpg', '../../assets/land/L1.jpg'],
      currentImageIndex: 0,
    },
    {
      id: 2,
      title: 'Land 2',
      location: 'Location 1',
      contact: '1234567890',
      price: '$300',
      images: ['../../assets/land/L4.jpg', '../../assets/land/L1.jpg'],
      currentImageIndex: 0,
    },
    {
      id: 3,
      title: 'Land 3',
      location: 'Location 1',
      contact: '1234567890',
      price: '$300',
      images: ['../../assets/land/L3.jpg', '../../assets/land/L1.jpg'],
      currentImageIndex: 0,
    },
    {
      id: 4,
      title: 'Land 4',
      location: 'Location 1',
      contact: '1234567890',
      price: '$300',
      images: ['../../assets/land/L2.jpg', '../../assets/land/L1.jpg'],
      currentImageIndex: 0,
    },
    // Additional lands can be added here...
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {
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
  goToDetails(type: string): void {
    this.router.navigate(['/details'], { queryParams: { type } });
  }
}
