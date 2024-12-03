import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as AOS from 'aos';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { VillageService } from 'src/app/address/village.service';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { RoomService } from 'src/app/Service/room.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent {
  gridCols = 2;
  room: any[] = [];
  currentPage = 0;
  totalPages = 1; // Total pages for pagination
  itemsPerPage = 24; // 12 room per page
  autoFetchInterval: any;
  search: string = '';
  fromPrice: number | null = null;
  toPrice: number | null = null;

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
    private roomService: RoomService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private districtService: DistrictService,
    private cdr: ChangeDetectorRef,
    private communeService: CommuneService,
    private villageService: VillageService,
    private authenticationService: AuthenticationService
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

    // Fetch room when query parameters change
    this.route.queryParams.subscribe((params) => {
      const fromPrice = params['fromPrice'] ? +params['fromPrice'] : undefined;
      const toPrice = params['toPrice'] ? +params['toPrice'] : undefined;
      const search = params['search'] || '';
      const page = params['page'] ? +params['page'] : 0; // Default to page 0
      const provinceId = params['provinceId']
        ? +params['provinceId']
        : undefined; // Fetch provinceId from query params

      // Call fetchRoom method and pass in provinceId
      this.fetchRoom(
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

  fetchRoom(
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
      page,
      size: this.itemsPerPage,
    };

    if (fromPrice !== undefined) params.fromPrice = fromPrice;
    if (toPrice !== undefined) params.toPrice = toPrice;
    if (search) params.search = search;
    if (provinceId !== undefined && provinceId !== null)
      params.provinceId = provinceId;

    this.roomService.getRooms(params).subscribe((response) => {
      const responseData = response.result;
      this.room = responseData.result;
      this.totalPages = responseData.totalPage;
      this.room.forEach((room) => {
        this.loadImage(room);
        const matchedProvince = this.provinces_c.find(
          (p) => p.id === room.province
        );
        room.provinceName = matchedProvince
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
      // Fetch communes when a district is selected
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
          this.fetchRoom(
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

    // Convert null to undefined before passing to fetchRooms
    this.fetchRoom(
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

    this.fetchRoom();
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.fetchRoomFromQueryParams();
    }
    this.scrollUpSlightly();

  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.fetchRoomFromQueryParams();
    }
    this.scrollUpSlightly();

  }

  changePage(page: number): void {
    this.currentPage = page;
    this.fetchRoomFromQueryParams();
    this.scrollUpSlightly();

  }

  private scrollUpSlightly(): void {
    // Calculate the current scroll position and reduce it by 50px
    const currentScroll = window.scrollY;
    const newScrollPosition = currentScroll - 1700;

    window.scrollTo({
      top: newScrollPosition > 0 ? newScrollPosition : 0, // Prevent negative scrolling
      behavior: 'smooth',
    });
  }

  fetchRoomFromQueryParams(): void {
    this.fetchRoom(
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
      pages.unshift(-1);
    }
    if (end < this.totalPages) {
      pages.push(-1);
    }

    return pages;
  }

  likeRoom(roomId: number): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to like this room.',
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    const room = this.room.find((h) => h.id === roomId);
    if (!room || room.pending) return;

    room.pending = true;
    console.log(`Toggling like for room ID ${roomId}`);

    this.roomService.likeRoom(roomId, 'room').subscribe({
      next: () => this.fetchRoomData(roomId),
      error: (error) => {
        console.error(`Error toggling like for room ID ${roomId}:`, error);
        this.fetchRoomData(roomId);
      },
      complete: () => {
        console.log(`Completed like toggle for room ID ${roomId}`);
        room.pending = false;
      },
    });
  }
  loadImage(room: any): void {
    if (room.imagePaths && room.imagePaths.length > 0) {
      room.safeImagePaths = [];
      room.imagePaths.forEach((imageUrl: string) => {
        this.roomService.getImage(imageUrl).subscribe((imageBlob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          room.safeImagePaths.push(safeUrl);
        });
      });
      room.currentImageIndex = 0;
    } else {
      room.safeImagePaths = [];
      room.currentImageIndex = 0;
    }
  }

  nextImage(room: any): void {
    if (room.currentImageIndex < room.safeImagePaths.length - 1) {
      room.currentImageIndex++;
    } else {
      room.currentImageIndex = 0;
    }
  }
  toggleFavorite(roomId: number): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to favorite this room.',
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }
    const room = this.room.find((h) => h.id === roomId);
    if (!room || room.pending) return;

    room.pending = true;
    console.log(`Toggling favorite for room ID ${roomId}`);

    this.roomService.toggleFavorite(roomId, 'room').subscribe({
      next: () => this.fetchRoomData(roomId),
      error: (error) => {
        console.error(`Error toggling favorite for room ID ${roomId}:`, error);
        this.fetchRoomData(roomId);
      },
      complete: () => {
        room.pending = false;
        console.log(`Completed favorite toggle for room ID ${roomId}`);
      },
    });
  }
  // Navigate to the previous image (loop to the last image if it's the first one)
  prevImage(room: any): void {
    if (room.currentImageIndex > 0) {
      room.currentImageIndex--;
    } else {
      room.currentImageIndex = room.safeImagePaths.length - 1; // Loop back to the last image
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
  private fetchRoomData(roomId: number): void {
    console.log(`Fetching updated data for room ID ${roomId}...`);

    this.roomService.getRoomById(roomId.toString()).subscribe({
      next: (response) => {
        const roomIndex = this.room.findIndex((h) => h.id === roomId);
        if (roomIndex > -1 && response.result) {
          const updatedRoom = response.result;
          this.room[roomIndex] = {
            ...this.room[roomIndex],
            likeCount: updatedRoom.likeCount,
            likeable: updatedRoom.likeable,
            favoriteable: updatedRoom.favoriteable,
            pending: false,
          };
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error(
          `Error fetching latest data for room ID ${roomId}:`,
          error
        );
      },
    });
  }

  goToDetails(roomId: number): void {
    // Call the API to count the view
    this.roomService.viewRoom(roomId).subscribe(() => {
      // Once the view is counted, navigate to the details page
      this.router.navigate(['/details-room', roomId]);
    });
  }
}
