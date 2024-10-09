import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as AOS from 'aos';
import { RoomService } from 'src/app/Service/room.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent {
  gridCols = 2;
  rooms: any[] = [];
  currentPage = 0;
  totalPages = 1; // Total pages for pagination
  itemsPerPage = 12; // 12 rooms per page
  autoFetchInterval: any;

  searchForm!: FormGroup;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private roomService: RoomService,
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

    // Fetch rooms when query parameters change
    this.route.queryParams.subscribe((params) => {
      const fromPrice = params['fromPrice'] ? +params['fromPrice'] : undefined;
      const toPrice = params['toPrice'] ? +params['toPrice'] : undefined;
      const search = params['search'] || '';
      const page = params['page'] ? +params['page'] : 0; // Default to page 0
      this.currentPage = page;

      // Fetch the rooms based on query parameters
      this.fetchHouses(fromPrice, toPrice, search, this.currentPage);
    });

    // Set up auto-fetch every 30 seconds (you can adjust the interval)
    this.autoFetchInterval = setInterval(() => {
      const search = this.searchForm.get('search')?.value;
      const fromPrice = this.searchForm.get('fromPrice')?.value;
      const toPrice = this.searchForm.get('toPrice')?.value;

      this.fetchHouses(fromPrice, toPrice, search, this.currentPage);
    }, 30000); // 30 seconds interval
  }

  // Fetch rooms based on query params
  fetchHouses(
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

    this.roomService.getRooms(params).subscribe((response) => {
      this.rooms = response.result.result;
      this.totalPages = response.result.totalPage; // Update the total number of pages

      // Load images safely
      this.rooms.forEach((house) => {
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

    // Fetch rooms after search
    this.fetchHouses(fromPrice, toPrice, search, 0);
  }

  // Clear the search form and reload all rooms
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
    this.fetchHouses(); // Fetch rooms without filters
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
  likeHouse(houseId: number): void {
    this.roomService.likeRoom(houseId).subscribe(() => {
      const house = this.rooms.find((h) => h.id === houseId);
      if (house) {
        house.likeCount += 1; // Increment the like count on the UI
      }
    });
  }

  loadImage(house: any): void {
    if (house.imagePaths && house.imagePaths.length > 0) {
      house.safeImagePaths = [];
      house.imagePaths.forEach((imageUrl: string) => {
        this.roomService.getImage(imageUrl).subscribe((imageBlob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          house.safeImagePaths.push(safeUrl);
        });
      });
      house.currentImageIndex = 0; // Start with the first image
    } else {
      // Ensure safeImagePaths and currentImageIndex are always defined, even if no images exist
      house.safeImagePaths = [];
      house.currentImageIndex = 0;
    }
  }

  // Navigate to the next image
  // Navigate to the next image (loop to the first image if it's the last one)
  nextImage(house: any): void {
    if (house.currentImageIndex < house.safeImagePaths.length - 1) {
      house.currentImageIndex++;
    } else {
      house.currentImageIndex = 0; // Loop back to the first image
    }
  }

  // Navigate to the previous image (loop to the last image if it's the first one)
  prevImage(house: any): void {
    if (house.currentImageIndex > 0) {
      house.currentImageIndex--;
    } else {
      house.currentImageIndex = house.safeImagePaths.length - 1; // Loop back to the last image
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

  goToDetails(houseId: number): void {
    // Call the API to count the view
    this.roomService.viewRoom(houseId).subscribe(() => {
      // Once the view is counted, navigate to the details page
      this.router.navigate(['/details', houseId]);
    });
  }
}
