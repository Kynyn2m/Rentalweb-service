import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// @ts-ignore
import * as AOS from 'aos';

@Component({
  selector: 'app-house',
  templateUrl: './house.component.html',
  styleUrls: ['./house.component.css'],
})
export class HouseComponent implements OnInit {
  gridCols = 2; // Set to 4 columns for a 4x5 grid
  // banners!: string;
  banners: string[] = [
    '../../assets/img/pp1.jpg',
    'https://via.placeholder.com/600x200.png?text=ads+2',
  ];

  // Houses data
  houses = [
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h4.jpg', '../../assets/house/h2.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h2.jpg', '../../assets/house/h1.jpeg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h3.jpg', '../../assets/house/h4.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h3.jpg', '../../assets/house/h2.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h2.jpg', '../../assets/house/h4.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h2.jpg', '../../assets/house/h4.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h4.jpg', '../../assets/house/h4.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h3.jpg', '../../assets/house/h4.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h5.jpg', '../../assets/house/h4.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h6.jpg', '../../assets/house/h5.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h7.jpg', '../../assets/house/h6.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h8.jpg', '../../assets/house/h9.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h9.jpg', '../../assets/house/h4.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h11.jpg', '../../assets/house/h4.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h12.jpg', '../../assets/house/h5.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h13.webp', '../../assets/house/h6.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h15.webp', '../../assets/house/h8.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h16.webp', '../../assets/house/h8.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h17.webp', '../../assets/house/h8.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h19.jpeg', '../../assets/house/h8.jpg'],
      currentImageIndex: 0,
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
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
      bedroom: 3,
      bathroom: 2,
      floor: 1,
    },
    // Additional house objects...
  ];

  // Pagination properties
  currentPage = 0;
  itemsPerPage = 20; // 4 columns * 5 rows = 20 houses per page

  constructor(private breakpointObserver: BreakpointObserver,private router: Router) {
    this.initializeGridCols();
  }

  // Get the paginated houses for the current page
  get paginatedHouses() {
    const startIndex = this.currentPage * this.itemsPerPage;
    return this.houses.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Calculate the total number of pages
  get totalPages() {
    return Math.ceil(this.houses.length / this.itemsPerPage);
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

  changePage(page: number) {
    this.currentPage = page;
    AOS.refresh(); // Refresh AOS to trigger animations on new content
  }

  // Navigate to the next page
  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  // Navigate to the previous page
  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  ngOnInit() {
    AOS.init({
      duration: 1200, // Duration of the animation in milliseconds
      once: true, // Whether animation should happen only once - while scrolling down
      mirror: false, // Whether elements should animate out while scrolling past them
    });
  }

  // Get the pages to display with "..." if there are many pages
  get pagesToShow(): number[] {
    const totalVisiblePages = 5; // Number of page numbers to show at a time
    const half = Math.floor(totalVisiblePages / 2);
    let start = Math.max(0, this.currentPage - half);
    let end = Math.min(this.totalPages, this.currentPage + half + 1);

    if (start === 0) {
      end = Math.min(totalVisiblePages, this.totalPages);
    }
    if (end === this.totalPages) {
      start = Math.max(0, this.totalPages - totalVisiblePages);
    }

    const pages: number[] = [];
    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    if (start > 0) {
      pages.unshift(-1); // Indicate "..." before the start
    }
    if (end < this.totalPages) {
      pages.push(-1); // Indicate "..." after the end
    }

    return pages;
  }

  // Initialize the grid columns based on the screen size
  private initializeGridCols(): void {
    const breakpoints = [
      { query: Breakpoints.HandsetPortrait, cols: 1 },
      { query: Breakpoints.HandsetLandscape, cols: 2 },
      { query: Breakpoints.TabletPortrait, cols: 2 },
      { query: Breakpoints.TabletLandscape, cols: 3 },
      { query: Breakpoints.WebPortrait, cols: 4 },
      { query: Breakpoints.WebLandscape, cols: 5 },
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
