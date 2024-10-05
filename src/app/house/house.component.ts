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
  totalPages = 1; // Total pages for pagination
  itemsPerPage = 12; // 12 houses per page

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
    // Initialize the search form
    this.searchForm = this.fb.group({
      search: [''],
      fromPrice: [''],
      toPrice: [''],
    });

    // Listen for query parameter changes and fetch houses based on the changes
    this.route.queryParams.subscribe(params => {
      const fromPrice = params['fromPrice'] ? +params['fromPrice'] : undefined;
      const toPrice = params['toPrice'] ? +params['toPrice'] : undefined;
      const search = params['search'] || '';
      const page = params['page'] ? +params['page'] : 0; // Default to page 0
      this.currentPage = page;

      // Fetch the houses based on query parameters
      this.fetchHouses(fromPrice, toPrice, search, this.currentPage);
    });
  }

  // Fetch houses based on query params
  fetchHouses(fromPrice?: number, toPrice?: number, search?: string, page: number = 0): void {
    const params: any = {
      page, // The current page
      size: this.itemsPerPage, // The number of items per page
    };

    if (fromPrice !== undefined) {
      params.fromPrice = fromPrice;
    }
    if (toPrice !== undefined) {
      params.toPrice = toPrice;
    }
    if (search) {
      params.search = search;
    }

    this.houseService.getHouses(params).subscribe(response => {
      this.houses = response.result.result;
      this.totalPages = response.result.totalPage; // Update the total number of pages

      // Load images safely
      this.houses.forEach(house => {
        this.loadImage(house);
      });
    });
  }

  // Handle the search form submission
  onSearch(): void {
    const search = this.searchForm.get('search')?.value;
    const fromPrice = this.searchForm.get('fromPrice')?.value;
    const toPrice = this.searchForm.get('toPrice')?.value;

    // Update the query parameters in the URL
    this.router.navigate([], {
      queryParams: {
        search: search || null,
        fromPrice: fromPrice || null,
        toPrice: toPrice || null,
        page: 0, // Reset to page 0 on search
      },
      queryParamsHandling: 'merge',
    });

    // Fetch houses after search
    this.fetchHouses(fromPrice, toPrice, search, 0);
  }

  // Clear the search form and reload all houses
  onClear(): void {
    this.searchForm.reset(); // Reset the search form
    this.router.navigate([], {
      queryParams: {
        search: null,
        fromPrice: null,
        toPrice: null,
        page: 0, // Reset to page 0
      },
      queryParamsHandling: 'merge',
    });
    this.fetchHouses(); // Fetch houses without filters
  }

  // Pagination methods
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.fetchHousesFromQueryParams();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.fetchHousesFromQueryParams();
    }
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.fetchHousesFromQueryParams();
  }

  fetchHousesFromQueryParams(): void {
    const search = this.searchForm.get('search')?.value || '';
    const fromPrice = this.searchForm.get('fromPrice')?.value || '';
    const toPrice = this.searchForm.get('toPrice')?.value || '';
    this.fetchHouses(fromPrice, toPrice, search, this.currentPage);
  }

  // Dynamically generate page numbers
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

  // Load house images safely
  loadImage(house: any): void {
    this.houseService.getImage(house.imagePath).subscribe(imageBlob => {
      const objectURL = URL.createObjectURL(imageBlob);
      house.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    });
  }

  // Dynamically adjust the number of columns based on the screen size
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
      .observe(breakpoints.map(bp => bp.query))
      .subscribe(result => {
        for (let bp of breakpoints) {
          if (result.breakpoints[bp.query]) {
            this.gridCols = bp.cols;
            break;
          }
        }
      });
  }

  // Navigate to house details
  goToDetails(houseId: string): void {
    this.router.navigate(['/house-details', houseId]);
  }
}
