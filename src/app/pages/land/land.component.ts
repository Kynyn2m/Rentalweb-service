import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, VERSION } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Route, Router } from '@angular/router';
import * as AOS from 'aos';
import { LandService } from 'src/app/add-post/add-post-land/land.service';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { VillageService } from 'src/app/address/village.service';

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
  itemsPerPage = 12; // 12 land per page
  autoFetchInterval: any;
  search: string = '';
  fromPrice: number | null = null;
  toPrice: number | null = null;

  isLoading: boolean = true;

  provinceId_c: number | null = 0; // To track the selected province
  provinces_c: any[] = []; // Array to store the list of provinces
  districtId_c: number | null = 0; // To track the selected district
  districts_c: any[] = []; // Array to store the list of districts
  communeId_c: number | null = 0; // To track the selected commune
  communes_c: any[] = [];
  villageId_c: number | null = 0; // To track the selected village
  villages_c: any[] = [];

  provinces: any[] = [];
  addressForm!: FormGroup;

  searchForm!: FormGroup;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private landService: LandService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private districtService: DistrictService,
    private cdr: ChangeDetectorRef,
    private communeService: CommuneService,
    private villageService: VillageService
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

    // Initialize the address form
    this.addressForm = this.fb.group({
      provinceId: [null], // Province ID control
      districtId: [null],
      communeId: [null],
      villageId: [null],
    });

    // Fetch the provinces
    this.districtService.getProvincesPublic().subscribe(
      (res) => {
        this.provinces_c = res.result.result || [];
      },
      (error) => {
        console.error('Error fetching provinces:', error);
      }
    );

    // Fetch land when query parameters change
    this.route.queryParams.subscribe((params) => {
      const fromPrice = params['fromPrice'] ? +params['fromPrice'] : undefined;
      const toPrice = params['toPrice'] ? +params['toPrice'] : undefined;
      const search = params['search'] || '';
      const page = params['page'] ? +params['page'] : 0; // Default to page 0
      const provinceId = params['provinceId']
        ? +params['provinceId']
        : undefined; // Fetch provinceId from query params

      // Call fetchLand method and pass in provinceId
      this.fetchLand(
        fromPrice,
        toPrice,
        search,
        provinceId,
        undefined,
        undefined,
        undefined,
        page
      );
    });
  }

  fetchLand(
    fromPrice?: number,
    toPrice?: number,
    search?: string,
    provinceId?: number,
    districtId?: number,
    communeId?: number,
    villageId?: number,
    page: number = 0
  ): void {
    const params: any = {
      page, // The current page
      size: this.itemsPerPage, // The number of items per page
    };

    // Add parameters only if they are defined
    if (fromPrice !== undefined) {
      params.fromPrice = fromPrice;
    }
    if (toPrice !== undefined) {
      params.toPrice = toPrice;
    }
    if (search) {
      params.search = search;
    }
    if (provinceId !== undefined && provinceId !== null) {
      params.provinceId = provinceId;
    }

    // Only include district, commune, and village if province is defined
    if (districtId !== undefined && districtId !== null && districtId !== 0) {
      params.districtId = districtId;
    }
    if (communeId !== undefined && communeId !== null && communeId !== 0) {
      params.communeId = communeId;
    }
    if (villageId !== undefined && villageId !== null && villageId !== 0) {
      params.villageId = villageId;
    }

    // Call the API
    this.landService.getLand(params).subscribe((response) => {
      const responseData = response.result;
      this.lands = responseData.result; // List of land
      this.totalPages = responseData.totalPage; // Total number of pages

      // Load images safely
      this.lands.forEach((land) => {
        this.loadImage(land);
        // Find and assign the province name
        const matchedProvince = this.provinces_c.find(
          (p) => p.id === land.province
        );
        land.provinceName = matchedProvince
          ? matchedProvince.khmerName || matchedProvince.englishName
          : 'Unknown Province';
      });
    });
  }

  onProvinceSelected(event: any): void {
    this.provinceId_c = event.value;

    if (this.provinceId_c !== null) {
      this.districtService.getByProvincePublic(this.provinceId_c).subscribe(
        (res) => {
          this.districts_c = res.result || [];
          this.communes_c = [];
          this.villages_c = [];
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching districts:', error);
        }
      );
    }
  }

  onDistrictSelected(event: any): void {
    this.districtId_c = event.value;

    if (this.districtId_c !== null) {
      this.communeService.getByDistrictPublic(this.districtId_c).subscribe(
        (res) => {
          this.communes_c = res.result || [];
          this.villages_c = [];
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching communes:', error);
        }
      );
    }
  }

  onCommuneSelected(event: any): void {
    this.communeId_c = event.value;

    if (this.communeId_c !== null) {
      this.villageService.getByCommunePublic(this.communeId_c).subscribe(
        (res) => {
          this.villages_c = res.result || [];
          this.cdr.detectChanges();

          // Fetch land with updated communeId
          this.fetchLand(
            this.searchForm.get('fromPrice')?.value,
            this.searchForm.get('toPrice')?.value,
            this.searchForm.get('search')?.value,
            this.provinceId_c !== null ? this.provinceId_c : undefined,
            this.districtId_c !== null ? this.districtId_c : undefined,
            this.communeId_c !== null ? this.communeId_c : undefined
          );
        },
        (error) => {
          console.error('Error fetching villages:', error);
        }
      );
    }
  }

  onVillageSelected(event: any): void {
    this.villageId_c = event.value;
    console.log('Village Selected:', this.villageId_c);

    this.fetchLand(
      undefined,
      undefined,
      undefined,
      this.provinceId_c !== null ? this.provinceId_c : undefined,
      this.districtId_c !== null ? this.districtId_c : undefined,
      this.communeId_c !== null ? this.communeId_c : undefined,
      this.villageId_c !== null ? this.villageId_c : undefined
    );
  }

  onSearch(): void {
    const queryParams: any = { page: 0 }; // Reset to page 0 on search

    if (this.provinceId_c && this.provinceId_c !== 0)
      queryParams.provinceId = this.provinceId_c;
    if (this.districtId_c && this.districtId_c !== 0)
      queryParams.districtId = this.districtId_c;
    if (this.communeId_c && this.communeId_c !== 0)
      queryParams.communeId = this.communeId_c;
    if (this.villageId_c && this.villageId_c !== 0)
      queryParams.villageId = this.villageId_c;

    if (this.search) queryParams.search = this.search;
    if (this.fromPrice !== null) queryParams.fromPrice = this.fromPrice;
    if (this.toPrice !== null) queryParams.toPrice = this.toPrice;

    // Update the query params in the URL and perform the search
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
    });

    // Convert null to undefined before passing to fetchHouses
    this.fetchLand(
      this.fromPrice ?? undefined,
      this.toPrice ?? undefined,
      this.search,
      this.provinceId_c ?? undefined,
      this.districtId_c ?? undefined,
      this.communeId_c ?? undefined,
      this.villageId_c ?? undefined,
      0
    );
  }

  onClear(): void {
    this.search = '';
    this.fromPrice = null;
    this.toPrice = null;
    this.provinceId_c = null;
    this.districtId_c = null;
    this.communeId_c = null;
    this.villageId_c = null;

    this.router.navigate([], {
      queryParams: {
        search: null,
        provinceId: null,
        districtId: null,
        communeId: null,
        villageId: null,
        fromPrice: null,
        toPrice: null,
        page: 0,
      },
      queryParamsHandling: 'merge',
    });

    this.fetchLand();
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
    const land = this.lands.find((h) => h.id === landId);
    if (land && !land.pending) {
      land.pending = true;
      if (land.liked) {
        land.likeCount -= 1;
        land.liked = false;
        land.pending = false;
      } else {
        this.landService.likeLand(landId).subscribe(
          () => {
            land.likeCount += 1;
            land.liked = true;
            land.pending = false;
          },
          () => {
            land.pending = false;
          }
        );
      }
    }
  }

  loadImage(land: any): void {
    if (land.imagePaths && land.imagePaths.length > 0) {
      land.safeImagePaths = [];
      land.imagePaths.forEach((imageUrl: string) => {
        this.landService.getImage(imageUrl).subscribe((imageBlob) => {
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
    this.landService.viewLand(landId).subscribe(() => {
      // Once the view is counted, navigate to the details page
      this.router.navigate(['/details-land', landId]);
    });
  }
}
