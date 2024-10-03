import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HouseService } from 'src/app/Service/house.service'; // Import the HouseService for fetching houses
import * as AOS from 'aos';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-house',
  templateUrl: './house.component.html',
  styleUrls: ['./house.component.css'],
})
export class HouseComponent implements OnInit {
  gridCols = 2;
  imageSrc: string | null = null;
  banners: string[] = [
    '../../assets/img/pp1.jpg',
    'https://via.placeholder.com/600x200.png?text=ads+2',
  ];

  houses: any[] = [];
  currentPage = 0;
  totalPages = 1; // Total pages for pagination
  itemsPerPage = 6; // Number of houses per page

  constructor(
    private breakpointObserver: BreakpointObserver,
    private houseService: HouseService, // Inject the HouseService
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.initializeGridCols();
  }

  ngOnInit(): void {
    this.fetchHouses(); // Fetch the house data when component initializes
    AOS.init({
      duration: 1200, // Duration of the animation in milliseconds
      once: true, // Whether animation should happen only once
      mirror: false, // Whether elements should animate out while scrolling past them
    });
  }

  // Fetch houses from the service
  fetchHouses(): void {
    this.houseService.getHouses().subscribe((response) => {
      this.houses = response.result.result;
      this.houses.forEach((house) => {
        this.loadImage(house);
      });
    });
  }

  // Method to load image with headers
  loadImage(house: any): void {
    this.houseService.getImage(house.imagePath).subscribe((imageBlob) => {
      const objectURL = URL.createObjectURL(imageBlob);
      house.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL); // Sanitizing image URL
    });
  }

  // Navigate to the next image in a card
  nextImage(house: any): void {
    house.currentImageIndex = (house.currentImageIndex + 1) % house.images.length;
  }

  // Navigate to the previous image in a card
  prevImage(house: any): void {
    house.currentImageIndex =
      (house.currentImageIndex - 1 + house.images.length) % house.images.length;
  }

  // Navigate to the next page
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.fetchHouses(); // Fetch the next page of houses
    }
  }

  // Navigate to the previous page
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.fetchHouses(); // Fetch the previous page of houses
    }
  }

  // Handle page change when user clicks on a specific page number
  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchHouses(); // Fetch houses for the selected page
    }
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

  // Go to house details page
  goToDetails(houseId: string): void {
    this.router.navigate(['/house-details', houseId]);
  }
}
