import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HouseService } from 'src/app/Service/house.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DistrictService } from '../address/district.service';
import { VillageService } from '../address/village.service';
import { CommuneService } from '../address/commune.service';

import Swal from 'sweetalert2';
import { AuthenticationService } from '../authentication/authentication.service';


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
  itemsPerPage = 24; // 12 houses per page
  loading: boolean = false;

  search: string = '';
  provinceId_c: number | null = 0; // To track the selected province
  districtId_c: number | null = 0; // To track the selected district
  communeId_c: number | null = 0; // To track the selected commune
  villageId_c: number | null = 0; // To track the selected village
  fromPrice: number | null = null;
  toPrice: number | null = null;

  provinces_c: any[] = [];
  districts_c: any[] = [];
  communes_c: any[] = [];
  villages_c: any[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private houseService: HouseService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private districtService: DistrictService,
    private cdr: ChangeDetectorRef,
    private authenticationService: AuthenticationService,
    private communeService: CommuneService,
    private villageService: VillageService,
  ) {
    this.initializeGridCols();
  }

  ngOnInit(): void {
    // Fetch the provinces on component initialization
    this.districtService.getProvincesPublic().subscribe(
      (res) => {
        this.provinces_c = res.result.result || [];
      },
      (error) => {
        console.error('Error fetching provinces:', error);
      }
    );

    // Listen to route queryParams changes
    this.route.queryParams.subscribe(params => {
      this.handleQueryParams(params);
    });
  }

  handleQueryParams(params: any): void {
    const fromPrice = params['fromPrice'] ? +params['fromPrice'] : undefined;
    const toPrice = params['toPrice'] ? +params['toPrice'] : undefined;
    const search = params['search'] || '';
    const page = params['page'] ? +params['page'] : 0; // Default to page 0
    const provinceId = params['provinceId'] ? +params['provinceId'] : undefined; // Fetch provinceId from query params

    // Call fetchHouses method and pass in provinceId
    this.fetchHouses(fromPrice, toPrice, search, provinceId, undefined, undefined, undefined, page);
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
    this.loading = true; // Start loading

    const params: any = {
      page,
      size: this.itemsPerPage,
    };

    if (fromPrice !== undefined) params.fromPrice = fromPrice;
    if (toPrice !== undefined) params.toPrice = toPrice;
    if (search) params.search = search;
    if (provinceId !== undefined && provinceId !== null) params.provinceId = provinceId;

    this.houseService.getHouses(params).subscribe(
      (response) => {
        const responseData = response.result;
        this.houses = responseData.result;
        this.totalPages = responseData.totalPage;

        this.houses.forEach(house => {
          this.loadImage(house);
          const matchedProvince = this.provinces_c.find(p => p.id === house.province);
          house.provinceName = matchedProvince ? matchedProvince.khmerName || matchedProvince.englishName : 'Unknown Province';
        });

        this.loading = false; // Stop loading once data is fetched
      },
      (error) => {
        this.loading = false; // Stop loading in case of an error
        console.error('Error fetching houses:', error);
      }
    );
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
        },
        (error) => {
          console.error('Error fetching villages:', error);
        }
      );
    }
  }

  onSearch(): void {
    const queryParams: any = { page: 0 }; // Reset to page 0 on search

    if (this.provinceId_c && this.provinceId_c !== 0) queryParams.provinceId = this.provinceId_c;
    if (this.districtId_c && this.districtId_c !== 0) queryParams.districtId = this.districtId_c;
    if (this.communeId_c && this.communeId_c !== 0) queryParams.communeId = this.communeId_c;
    if (this.villageId_c && this.villageId_c !== 0) queryParams.villageId = this.villageId_c;

    if (this.search) queryParams.search = this.search;
    if (this.fromPrice !== null) queryParams.fromPrice = this.fromPrice;
    if (this.toPrice !== null) queryParams.toPrice = this.toPrice;

    // Update the query params in the URL and perform the search
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
    });

    // Convert null to undefined before passing to fetchHouses
    this.fetchHouses(
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
        page: 0
      },
      queryParamsHandling: 'merge',
    });

    this.fetchHouses();
  }


  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.fetchHousesFromQueryParams();
    }
    this.scrollUpSlightly();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.fetchHousesFromQueryParams();
    }
    this.scrollUpSlightly();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.fetchHousesFromQueryParams();
    this.scrollUpSlightly();
  }

  private scrollUpSlightly(): void {
    const currentScroll = window.scrollY;
    const newScrollPosition = currentScroll - 2550;

    window.scrollTo({
      top: newScrollPosition > 0 ? newScrollPosition : 0,
      behavior: 'smooth',
    });
  }

  fetchHousesFromQueryParams(): void {
    this.fetchHouses(
      this.fromPrice ?? undefined,
      this.toPrice ?? undefined,
      this.search,
      this.provinceId_c ?? undefined,
      this.districtId_c ?? undefined,
      this.communeId_c ?? undefined,
      this.villageId_c ?? undefined,
      this.currentPage
    );
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
      pages.unshift(-1); // To indicate more pages at the beginning
    }
    if (end < this.totalPages) {
      pages.push(-1); // To indicate more pages at the end
    }

    return pages;
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
      house.currentImageIndex = 0;
    } else {
      house.safeImagePaths = [];
      house.currentImageIndex = 0;
    }
  }

  nextImage(house: any): void {
    if (house.currentImageIndex < house.safeImagePaths.length - 1) {
      house.currentImageIndex++;
    } else {
      house.currentImageIndex = 0;
    }
  }

  prevImage(house: any): void {
    if (house.currentImageIndex > 0) {
      house.currentImageIndex--;
    } else {
      house.currentImageIndex = house.safeImagePaths.length - 1;
    }
  }

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
    this.houseService.viewHouse(houseId).subscribe(() => {
      this.router.navigate(['/details', houseId]);
    });
  }


  likeHouse(houseId: number): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to like this house.',
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    const house = this.houses.find(h => h.id === houseId);
    if (!house || house.pending) return;

    house.pending = true;
    console.log(`Toggling like for house ID ${houseId}`);

    this.houseService.likeHouse(houseId, 'house').subscribe({
      next: () => this.fetchHouseData(houseId),
      error: (error) => {
        console.error(`Error toggling like for house ID ${houseId}:`, error);
        this.fetchHouseData(houseId);
      },
      complete: () => {
        console.log(`Completed like toggle for house ID ${houseId}`);
        house.pending = false;
      }
    });
  }


  toggleFavorite(houseId: number): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to favorite this house.',
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    const house = this.houses.find(h => h.id === houseId);
    if (!house || house.pending) return;

    house.pending = true;
    console.log(`Toggling favorite for house ID ${houseId}`);

    this.houseService.toggleFavorite(houseId, 'house').subscribe({
      next: () => this.fetchHouseData(houseId),
      error: (error) => {
        console.error(`Error toggling favorite for house ID ${houseId}:`, error);
        this.fetchHouseData(houseId);
      },
      complete: () => {
        house.pending = false;
        console.log(`Completed favorite toggle for house ID ${houseId}`);
      }
    });
  }


  private fetchHouseData(houseId: number): void {
    console.log(`Fetching updated data for house ID ${houseId}...`);

    this.houseService.getHouseById(houseId.toString()).subscribe({
      next: (response) => {
        const houseIndex = this.houses.findIndex(h => h.id === houseId);
        if (houseIndex > -1 && response.result) {
          const updatedHouse = response.result;
          this.houses[houseIndex] = {
            ...this.houses[houseIndex],
            likeCount: updatedHouse.likeCount,
            likeable: updatedHouse.likeable,
            favoriteable: updatedHouse.favoriteable,
            pending: false
          };
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error(`Error fetching latest data for house ID ${houseId}:`, error);
      }
    });
  }





}
