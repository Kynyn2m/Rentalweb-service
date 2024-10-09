import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HouseService } from 'src/app/Service/house.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DistrictService } from '../address/district.service';
import { VillageService } from '../address/village.service';
import { CommuneService } from '../address/commune.service';

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
  autoFetchInterval: any;

  provinceId_c: number | null = 0; // To track the selected province
  provinces_c: any[] = []; // Array to store the list of provinces
  districtId_c: number | null = 0; // To track the selected district
  districts_c: any[] = []; // Array to store the list of districts
  communeId_c: number | null = 0;   // To track the selected commune
  communes_c: any[] = [];
  villageId_c: number | null = 0;   // To track the selected village
  villages_c: any[] = [];


  provinces: any[] = [];
  addressForm!: FormGroup;

  searchForm!: FormGroup;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private houseService: HouseService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private districtService: DistrictService,
    private cdr: ChangeDetectorRef,
    private communeService: CommuneService,
    private villageService: VillageService,
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
      provinceId: [null],  // Province ID control
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

    // Fetch houses when query parameters change
    this.route.queryParams.subscribe(params => {
      const fromPrice = params['fromPrice'] ? +params['fromPrice'] : undefined;
      const toPrice = params['toPrice'] ? +params['toPrice'] : undefined;
      const search = params['search'] || '';
      const page = params['page'] ? +params['page'] : 0; // Default to page 0
      const provinceId = params['provinceId'] ? +params['provinceId'] : undefined; // Fetch provinceId from query params

      // Call fetchHouses method and pass in provinceId
      this.fetchHouses(fromPrice, toPrice, search, provinceId, undefined, undefined, undefined, page);
    });
  }

  fetchHouses(
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
    this.houseService.getHouses(params).subscribe(response => {
      const responseData = response.result;
      this.houses = responseData.result; // List of houses
      this.totalPages = responseData.totalPage; // Total number of pages

      // Load images safely
      this.houses.forEach(house => {
        this.loadImage(house);
      });
    });
  }


  onProvinceSelected(event: any): void {
    this.provinceId_c = event.value;
    console.log('Province Selected:', this.provinceId_c);

    if (this.provinceId_c !== null) {
      // Fetch districts when a province is selected
      this.districtService.getByProvincePublic(this.provinceId_c).subscribe(
        (res) => {
          this.districts_c = res.result || [];
          this.communes_c = [];
          this.villages_c = [];
          this.cdr.detectChanges();  // Trigger change detection

          // Call fetchHouses with all necessary parameters, including the provinceId
          this.fetchHouses(
            this.searchForm.get('fromPrice')?.value,
            this.searchForm.get('toPrice')?.value,
            this.searchForm.get('search')?.value,
            this.provinceId_c || undefined
          );
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
    // Fetch communes when a district is selected
    this.communeService.getByDistrictPublic(this.districtId_c).subscribe(
      (res) => {
        this.communes_c = res.result || [];
        this.villages_c = [];
        this.cdr.detectChanges();

        // Fetch houses with updated districtId
        this.fetchHouses(
          this.searchForm.get('fromPrice')?.value,
          this.searchForm.get('toPrice')?.value,
          this.searchForm.get('search')?.value,
          this.provinceId_c !== null ? this.provinceId_c : undefined,
          this.districtId_c !== null ? this.districtId_c : undefined
        );
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

        // Fetch houses with updated communeId
        this.fetchHouses(
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

  this.fetchHouses(undefined, undefined, undefined, this.provinceId_c !== null ? this.provinceId_c : undefined, this.districtId_c !== null ? this.districtId_c : undefined, this.communeId_c !== null ? this.communeId_c : undefined, this.villageId_c !== null ? this.villageId_c : undefined);
}


onSearch(): void {
  const search = this.searchForm.get('search')?.value;
  const fromPrice = this.searchForm.get('fromPrice')?.value;
  const toPrice = this.searchForm.get('toPrice')?.value;

  const queryParams: any = {
    page: 0, // Reset to page 0 on search
  };

  // Include provinceId in the search query
  if (this.provinceId_c && this.provinceId_c !== 0) {
    queryParams.provinceId = this.provinceId_c;
  }

  // Include other parameters if they exist
  if (search) {
    queryParams.search = search;
  }
  if (fromPrice) {
    queryParams.fromPrice = fromPrice;
  }
  if (toPrice) {
    queryParams.toPrice = toPrice;
  }

  // Update the query params in the URL and perform the search
  this.router.navigate([], {
    queryParams,
    queryParamsHandling: 'merge',
  });

  // Perform the house search with the query parameters
  this.fetchHouses(
    fromPrice,
    toPrice,
    search,
    this.provinceId_c || undefined, // Handle undefined/null properly
    this.districtId_c !== 0 ? this.districtId_c || undefined : undefined,
    this.communeId_c !== 0 ? this.communeId_c || undefined : undefined,
    this.villageId_c !== 0 ? this.villageId_c || undefined : undefined,
    0
  );
}






onClear(): void {
  // Reset the search form fields
  this.searchForm.reset();

  // Reset the address form fields for province, district, commune, and village
  this.addressForm.patchValue({
    provinceId: null,  // Reset Province/City selection
    districtId: null,  // Reset District/Khan selection
    communeId: null,   // Reset Commune/Sangkat selection
    villageId: null    // Reset Village selection
  });

  // Clear the options for dependent selects
  this.districts_c = [];
  this.communes_c = [];
  this.villages_c = [];

  // Reset query parameters including provinceId, districtId, communeId, and villageId
  this.router.navigate([], {
    queryParams: {
      search: null,
      fromPrice: null,
      toPrice: null,
      provinceId: null,
      districtId: null,
      communeId: null,
      villageId: null,
      page: 0,  // Reset to page 0
    },
    queryParamsHandling: 'merge',
  });

  // Fetch houses without filters
  this.fetchHouses();
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
    this.houseService.likeHouse(houseId).subscribe(() => {
      const house = this.houses.find(h => h.id === houseId);
      if (house) {
        house.likeCount += 1; // Increment the like count on the UI
      }
    });
  }

  loadImage(house: any): void {
    if (house.imagePaths && house.imagePaths.length > 0) {
      house.safeImagePaths = [];
      house.imagePaths.forEach((imageUrl: string) => {
        this.houseService.getImage(imageUrl).subscribe(imageBlob => {
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

  goToDetails(houseId: number): void {
    // Call the API to count the view
    this.houseService.viewHouse(houseId).subscribe(() => {
      // Once the view is counted, navigate to the details page
      this.router.navigate(['/details', houseId]);
    });
  }

}
