import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HouseService } from 'src/app/Service/house.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-house',
  templateUrl: './house.component.html',
  styleUrls: ['./house.component.css'],
})
export class HouseComponent implements OnInit {
  gridCols = 2;
  houses: any[] = [];
  currentPage = 0;
  totalPages = 1;
  itemsPerPage = 6;

  searchForm!: FormGroup;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private houseService: HouseService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.initializeGridCols();
  }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      search: [''],
      fromPrice: [''],
      toPrice: [''],
    });

    this.route.queryParams.subscribe(params => {
      const fromPrice = params['fromPrice'] ? +params['fromPrice'] : undefined;
      const toPrice = params['toPrice'] ? +params['toPrice'] : undefined;
      const search = params['search'] || '';

      // Fetch the houses based on query parameters
      this.fetchHouses(fromPrice, toPrice, search);
    });
  }

  // Fetch houses based on query params
  fetchHouses(fromPrice?: number, toPrice?: number, search?: string): void {
    const params: any = {
      page: this.currentPage,
      itemsPerPage: this.itemsPerPage,
    };

    // Add search parameters if they exist
    if (fromPrice !== undefined) {
      params.fromPrice = fromPrice;
    }
    if (toPrice !== undefined) {
      params.toPrice = toPrice;
    }
    if (search) {
      params.search = search;
    }

    this.houseService.getHouses(params).subscribe((response) => {
      this.houses = response.result.result;
      this.houses.forEach((house) => {
        this.loadImage(house);
      });
      this.totalPages = response.result.totalPages;
    });
  }

  // Method to handle form submission and query parameters update
  onSearch(): void {
    const search = this.searchForm.get('search')?.value;
    const fromPrice = this.searchForm.get('fromPrice')?.value;
    const toPrice = this.searchForm.get('toPrice')?.value;

    // Set query parameters in the URL
    this.router.navigate([], {
      queryParams: {
        search: search || null,
        fromPrice: fromPrice || null,
        toPrice: toPrice || null,
      },
      queryParamsHandling: 'merge',
    });

    // Call fetchHouses to apply the search
    this.fetchHouses(fromPrice, toPrice, search);
  }

  // Method to clear the form and reset the search
  onClear(): void {
    // Reset the form values
    this.searchForm.reset();

    // Clear the query params and fetch all houses again
    this.router.navigate([], {
      queryParams: {
        search: null,
        fromPrice: null,
        toPrice: null,
      },
      queryParamsHandling: 'merge',
    });

    // Fetch unfiltered houses
    this.fetchHouses();
  }

  // Method to load image with headers
  loadImage(house: any): void {
    this.houseService.getImage(house.imagePath).subscribe((imageBlob) => {
      const objectURL = URL.createObjectURL(imageBlob);
      house.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
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
      this.fetchHouses();
    }
  }

  // Navigate to the previous page
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.fetchHouses();
    }
  }


  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchHouses();
    }
  }


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
