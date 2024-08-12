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
    'https://via.placeholder.com/600x200.png?text=Banner+1',
    'https://via.placeholder.com/600x200.png?text=Banner+2',
  ];
  currentBannerIndex: number = 0;

  // Rooms data
  rooms = [
    {
      title: 'Room 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$100',
      images: [
        'https://via.placeholder.com/300x200.png?text=Room+1',
        'https://via.placeholder.com/300x200.png?text=Room+1+Alt',
      ],
      currentImageIndex: 0,
    },
    {
      title: 'Room 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$100',
      images: [
        'https://via.placeholder.com/300x200.png?text=Room+1',
        'https://via.placeholder.com/300x200.png?text=Room+1+Alt',
      ],
      currentImageIndex: 0,
    },
    {
      title: 'Room 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$100',
      images: [
        'https://via.placeholder.com/300x200.png?text=Room+1',
        'https://via.placeholder.com/300x200.png?text=Room+1+Alt',
      ],
      currentImageIndex: 0,
    },
    {
      title: 'Room 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$100',
      images: [
        'https://via.placeholder.com/300x200.png?text=Room+1',
        'https://via.placeholder.com/300x200.png?text=Room+1+Alt',
      ],
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
      images: [
        'https://via.placeholder.com/300x200.png?text=House+1',
        'https://via.placeholder.com/300x200.png?text=House+1+Alt',
      ],
      currentImageIndex: 0,
    },
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
    },
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
    },
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
      images: [
        'https://via.placeholder.com/300x200.png?text=Land+1',
        'https://via.placeholder.com/300x200.png?text=Land+1+Alt',
      ],
      currentImageIndex: 0,
    },
    {
      title: 'Land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$300',
      images: [
        'https://via.placeholder.com/300x200.png?text=Land+1',
        'https://via.placeholder.com/300x200.png?text=Land+1+Alt',
      ],
      currentImageIndex: 0,
    },
    {
      title: 'Land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$300',
      images: [
        'https://via.placeholder.com/300x200.png?text=Land+1',
        'https://via.placeholder.com/300x200.png?text=Land+1+Alt',
      ],
      currentImageIndex: 0,
    },
    {
      title: 'Land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$300',
      images: [
        'https://via.placeholder.com/300x200.png?text=Land+1',
        'https://via.placeholder.com/300x200.png?text=Land+1+Alt',
      ],
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
