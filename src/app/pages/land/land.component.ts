import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, VERSION } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Route, Router } from '@angular/router';
import * as AOS from 'aos';
import { LandService } from 'src/app/add-post/add-post-land/land.service';

@Component({
  selector: 'app-land',
  templateUrl: './land.component.html',
  styleUrls: ['./land.component.css'],
})
export class LandComponent {
  gridCols = 2;
  lands: any[] = [];
  currentPage = 0;
  totalPages = 1; // Total pages for pagination
  itemsPerPage = 12; // 12 lands per page
  autoFetchInterval: any;

  searchForm!: FormGroup;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private landervice: LandService,
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

    // Fetch lands when query parameters change
    this.route.queryParams.subscribe((params) => {
      const fromPrice = params['fromPrice'] ? +params['fromPrice'] : undefined;
      const toPrice = params['toPrice'] ? +params['toPrice'] : undefined;
      const search = params['search'] || '';
      const page = params['page'] ? +params['page'] : 0; // Default to page 0
      this.currentPage = page;

      // Fetch the lands based on query parameters
      this.fetchLand(fromPrice, toPrice, search, this.currentPage);
    });

    // Set up auto-fetch every 30 seconds (you can adjust the interval)
    this.autoFetchInterval = setInterval(() => {
      const search = this.searchForm.get('search')?.value;
      const fromPrice = this.searchForm.get('fromPrice')?.value;
      const toPrice = this.searchForm.get('toPrice')?.value;

      this.fetchLand(fromPrice, toPrice, search, this.currentPage);
    }, 30000); // 30 seconds interval
  }

  // Fetch lands based on query params
  fetchLand(
    fromPrice?: number,
    toPrice?: number,
    search?: string,
    page: number = 0
  ): void {
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

    this.landervice.getLand(params).subscribe((response) => {
      this.lands = response.result.result;
      this.totalPages = response.result.totalPage; // Update the total number of pages

      // Load images safely
      this.lands.forEach((land) => {
        this.loadImage(land);
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

    // Fetch lands after search
    this.fetchLand(fromPrice, toPrice, search, 0);
  }

  // Clear the search form and reload all lands
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
    this.fetchLand(); // Fetch lands without filters
  }

  // Pagination methods
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.fetchLandFromQueryParams();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.fetchLandFromQueryParams();
    }
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.fetchLandFromQueryParams();
  }

  fetchLandFromQueryParams(): void {
    const search = this.searchForm.get('search')?.value || '';
    const fromPrice = this.searchForm.get('fromPrice')?.value || '';
    const toPrice = this.searchForm.get('toPrice')?.value || '';
    this.fetchLand(fromPrice, toPrice, search, this.currentPage);
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
  likeLand(landId: number): void {
    this.landervice.likeLand(landId).subscribe(() => {
      const land = this.lands.find((h) => h.id === landId);
      if (land) {
        land.likeCount += 1; // Increment the like count on the UI
      }
    });
  }

  loadImage(land: any): void {
    if (land.imagePaths && land.imagePaths.length > 0) {
      land.safeImagePaths = [];
      land.imagePaths.forEach((imageUrl: string) => {
        this.landervice.getImage(imageUrl).subscribe((imageBlob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          land.safeImagePaths.push(safeUrl);
        });
      });
      land.currentImageIndex = 0; // Start with the first image
    } else {
      // Ensure safeImagePaths and currentImageIndex are always defined, even if no images exist
      land.safeImagePaths = [];
      land.currentImageIndex = 0;
    }
  }

  // Navigate to the next image
  // Navigate to the next image (loop to the first image if it's the last one)
  nextImage(land: any): void {
    if (land.currentImageIndex < land.safeImagePaths.length - 1) {
      land.currentImageIndex++;
    } else {
      land.currentImageIndex = 0; // Loop back to the first image
    }
  }

  // Navigate to the previous image (loop to the last image if it's the first one)
  prevImage(land: any): void {
    if (land.currentImageIndex > 0) {
      land.currentImageIndex--;
    } else {
      land.currentImageIndex = land.safeImagePaths.length - 1; // Loop back to the last image
    }
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

  goToDetails(landId: number): void {
    // Call the API to count the view
    this.landervice.viewLand(landId).subscribe(() => {
      // Once the view is counted, navigate to the details page
      this.router.navigate(['/details', landId]);
    });
  }
}
