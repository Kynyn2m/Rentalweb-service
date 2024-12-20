// home.component.ts
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HouseService } from 'src/app/Service/house.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { RoomService } from '../Service/room.service';
import { LandService } from '../add-post/add-post-land/land.service';
import { DistrictService } from '../address/district.service';
import Swal from 'sweetalert2';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  images = [
    { url: '/assets/img/Banner house.png', alt: 'house', route: '/house' },
    { url: '/assets/img/Banner room.png', alt: 'room', route: '/room' },
    { url: '/assets/img/baner land.png', alt: 'land', route: '/land' },
  ];
  houses: any[] = [];
  rooms: any[] = [];
  lands: any[] = [];
  currentPage = 0;
  totalPages = 1;
  itemsPerPage = 24;
  searchForm!: FormGroup;
  isLoadingMore = false;
  autoFetchInterval: any;
  holdDuration: number = 500000000;
  currentImageIndex = 0;
  autoSlideInterval: any;

  isMouseDown: boolean = false;
  mouseDownTimer: any;

  isLoadingRooms = false;
  isLoadingLands = false;
  isLoadingHouses = false;

  provinces_c: any[] = []; // Array to store the list of provinces
  districtId_c: number | null = 0; // To track the selected district

  // Banner images
  banners: string[] = [
    '../../assets/ads&baner/Thesis.jpg',
    '../../assets/homepage/h1r.jpg',
  ];

  constructor(
    private houseService: HouseService,
    private router: Router,
    private route: ActivatedRoute,
    private landervice: LandService,
    private fb: FormBuilder,
    private roomService: RoomService,
    private sanitizer: DomSanitizer,
    private districtService: DistrictService,
    private breakpointObserver: BreakpointObserver,
    private authenticationService: AuthenticationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.startAutoSlide();
    this.searchForm = this.fb.group({
      search: [''],
      fromPrice: [''],
      toPrice: [''],
    });

    this.route.queryParams.subscribe((params) => {
      const fromPrice = params['fromPrice'];
      const toPrice = params['toPrice'];
      const search = params['search'];
      const provinceName = params['provinceName'];
      this.fetchHouses(fromPrice, toPrice, search, this.currentPage);
    });
    this.autoFetchInterval = setInterval(() => {
      const search = this.searchForm.get('search')?.value;
      const fromPrice = this.searchForm.get('fromPrice')?.value;
      const toPrice = this.searchForm.get('toPrice')?.value;

      this.fetchHouses(fromPrice, toPrice, search, this.currentPage);
    }, 300000); // 30 seconds interval

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
      this.fetchRoom(fromPrice, toPrice, search, this.currentPage);
    });

    // Set up auto-fetch every 30 seconds (you can adjust the interval)s
    this.autoFetchInterval = setInterval(() => {
      const search = this.searchForm.get('search')?.value;
      const fromPrice = this.searchForm.get('fromPrice')?.value;
      const toPrice = this.searchForm.get('toPrice')?.value;

      this.fetchRoom(fromPrice, toPrice, search, this.currentPage);
    }, 300000); // 30 seconds interval
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
    }, 300000); // 30 seconds interval

    this.districtService.getProvincesPublic().subscribe(
      (res) => {
        this.provinces_c = res.result.result || [];
      },
      (error) => {
        console.error('Error fetching provinces:', error);
      }
    );
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextImage1();
    }, 4000); // Change image every 3 seconds
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  nextImage1(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  prevImage1(): void {
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.images.length) % this.images.length;
  }
  setImage(index: number): void {
    this.currentImageIndex = index;
    this.stopAutoSlide(); // Stop the current auto-slide interval
    this.startAutoSlide(); // Restart the auto-slide after manually changing the image
  }

  fetchLand(
    fromPrice?: number,
    toPrice?: number,
    search?: string,
    page: number = 0,
    provinceName?: string
  ): void {
    this.isLoadingLands = true; // Start loading
    const params: any = {
      page,
      size: this.itemsPerPage,
    };

    if (fromPrice !== undefined) params.fromPrice = fromPrice;
    if (toPrice !== undefined) params.toPrice = toPrice;
    if (search) params.search = search;

    if (provinceName) {
      const matchedProvince = this.provinces_c.find(
        (p) => p.khmerName === provinceName || p.englishName === provinceName
      );
      if (matchedProvince) {
        params.provinceId = matchedProvince.id;
      }
    }

    this.landervice.getLand(params).subscribe(
      (response) => {
        this.lands = response.result.result;
        this.totalPages = response.result.totalPage;

        this.lands.forEach((land) => {
          this.loadImage(land);
          const matchedProvince = this.provinces_c.find(
            (p) => p.id === land.province
          );
          if (matchedProvince) {
            land.provinceName =
              matchedProvince.khmerName || matchedProvince.englishName;
          } else {
            console.log(
              `Unknown Province for land ID: ${land.id}, Province ID: ${land.province}`
            );
            land.provinceName = 'Unknown Province';
          }
        });
        this.isLoadingLands = false; // End loading
      },
      () => {
        this.isLoadingLands = false; // End loading on error
      }
    );
  }

  fetchRoom(
    fromPrice?: number,
    toPrice?: number,
    search?: string,
    page: number = 0,
    provinceName?: string
  ): void {
    this.isLoadingRooms = true; // Start loading
    const params: any = {
      page,
      size: this.itemsPerPage,
    };

    if (fromPrice !== undefined) params.fromPrice = fromPrice;
    if (toPrice !== undefined) params.toPrice = toPrice;
    if (search) params.search = search;

    if (provinceName) {
      const matchedProvince = this.provinces_c.find(
        (p) => p.khmerName === provinceName || p.englishName === provinceName
      );
      if (matchedProvince) {
        params.provinceId = matchedProvince.id;
      }
    }

    this.roomService.getRooms(params).subscribe(
      (response) => {
        this.rooms = response.result.result;
        this.totalPages = response.result.totalPage;

        this.rooms.forEach((room) => {
          this.loadImage(room);
          const matchedProvince = this.provinces_c.find(
            (p) => p.id === room.province
          );
          if (matchedProvince) {
            room.provinceName =
              matchedProvince.khmerName || matchedProvince.englishName;
          } else {
            console.log(
              `Unknown Province for room ID: ${room.id}, Province ID: ${room.province}`
            );
            room.provinceName = 'Unknown Province';
          }
        });
        this.isLoadingRooms = false; // End loading
      },
      () => {
        this.isLoadingRooms = false; // End loading on error
      }
    );
  }

  fetchHouses(
    fromPrice?: number,
    toPrice?: number,
    search?: string,
    provinceId?: number,
    districtId?: number,
    communeId?: number,
    villageId?: number,
    page: number = 0,
    provinceName?: string
  ): void {
    this.isLoadingHouses = true; // Start loading
    const params: any = {
      page,
      size: this.itemsPerPage,
    };

    if (fromPrice !== undefined) params.fromPrice = fromPrice;
    if (toPrice !== undefined) params.toPrice = toPrice;
    if (search) params.search = search;

    if (provinceName) {
      const matchedProvince = this.provinces_c.find(
        (p) => p.khmerName === provinceName || p.englishName === provinceName
      );
      if (matchedProvince) {
        params.provinceId = matchedProvince.id;
      }
    } else if (provinceId !== undefined && provinceId !== null) {
      params.provinceId = provinceId;
    }

    this.houseService.getHouses(params).subscribe(
      (response) => {
        const responseData = response.result;
        this.houses = responseData.result;
        this.totalPages = responseData.totalPage;

        this.houses.forEach((house) => {
          this.loadImage(house);
          const matchedProvince = this.provinces_c.find(
            (p) => p.id == house.province
          ); // Use loose equality to handle type mismatch
          if (matchedProvince) {
            house.provinceName =
              matchedProvince.khmerName || matchedProvince.englishName;
          } else {
            house.provinceName = 'Unknown Province'; // Fallback if no match is found
          }
        });
        this.isLoadingHouses = false; // End loading
      },
      () => {
        this.isLoadingHouses = false; // End loading on error
      }
    );
  }

  // likeHouse(houseId: number): void {
  //   const house = this.houses.find((h) => h.id === houseId);

  //   if (house && !house.pending) {
  //     // Ensure there's no pending request
  //     house.pending = true; // Set the pending state to prevent multiple clicks

  //     if (house.liked) {
  //       // Simulate "unlike" (no API call here for unlike)
  //       house.likeCount -= 1;
  //       house.liked = false;
  //       house.pending = false; // Reset the pending state after local unlike
  //     } else {
  //       // Call the like API
  //       this.houseService.likeHouse(houseId).subscribe(
  //         () => {
  //           house.likeCount += 1; // Increment the like count on the UI
  //           house.liked = true; // Set the liked state to true
  //           house.pending = false; // Reset the pending state after the API call completes
  //         },
  //         () => {
  //           // Handle error case
  //           house.pending = false; // Reset pending state even on error
  //         }
  //       );
  //     }
  //   }
  // }

  goToDetails(houseId: number): void {
    // Call the API to count the view
    this.houseService.viewHouse(houseId).subscribe(() => {
      // Once the view is counted, navigate to the details page
      this.router.navigate(['/details', houseId]);
    });
  }
  // detailLand
  goToDetailLand(landId: number): void {
    // Call the API to count the view
    this.landervice.viewLand(landId).subscribe(() => {
      // Once the view is counted, navigate to the details page
      this.router.navigate(['/details-land', landId]);
    });
  }
  // detailroom
  goToDetailRoom(roomId: number): void {
    // Call the API to count the view
    this.roomService.viewRoom(roomId).subscribe(() => {
      // Once the view is counted, navigate to the details page
      this.router.navigate(['/details-room', roomId]);
    });
  }
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
  loadImage(house: any): void {
    if (house.imagePaths && house.imagePaths.length > 0) {
      house.safeImagePaths = [];
      house.imagePaths.forEach((imageUrl: string) => {
        this.houseService.getImage(imageUrl).subscribe((imageBlob) => {
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
  nextImage(house: any): void {
    if (house.currentImageIndex < house.safeImagePaths.length - 1) {
      house.currentImageIndex++;
    } else {
      house.currentImageIndex = 0; // Loop back to the first image
    }
  }

  prevImage(house: any): void {
    if (house.currentImageIndex > 0) {
      house.currentImageIndex--;
    } else {
      house.currentImageIndex = house.safeImagePaths.length - 1; // Loop back to the last image
    }
  }
  onMouseDown(event: MouseEvent, houseId: number): void {
    this.isMouseDown = true;
    this.mouseDownTimer = setTimeout(() => {
      this.isMouseDown = false; // Consider as a long press
    }, this.holdDuration);
  }

  // Called when the user releases the mouse button
  onMouseUp(event: MouseEvent, houseId: number): void {
    // If mouseDownTimer is still active, consider it a click
    clearTimeout(this.mouseDownTimer);

    if (this.isMouseDown) {
      this.isMouseDown = false;
      this.goToDetails(houseId); // Trigger navigation only if it's a short click
    }
  }

  // Called when the mouse leaves the card (cancel the click)
  onMouseLeave(event: MouseEvent): void {
    clearTimeout(this.mouseDownTimer);
    this.isMouseDown = false; // Cancel the action when leaving the card
  }
  loadMoreHouses(): void {
    // Navigate to the dedicated 'houses' route, passing any necessary parameters
    this.router.navigate(['/house'], {
      queryParams: {
        page: this.currentPage,
        size: this.itemsPerPage,
      },
    });
  }
  loadMoreroom(): void {
    // Navigate to the dedicated 'houses' route, passing any necessary parameters
    this.router.navigate(['/room'], {
      queryParams: {
        page: this.currentPage,
        size: this.itemsPerPage,
      },
    });
  }
  loadMoreland(): void {
    // Navigate to the dedicated 'houses' route, passing any necessary parameters
    this.router.navigate(['/land'], {
      queryParams: {
        page: this.currentPage,
        size: this.itemsPerPage,
      },
    });
  }
  toggleFavoriteHouse(houseId: number): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to favorite this house.',
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

    const house = this.houses.find((h) => h.id === houseId);
    if (!house || house.pending) return;

    house.pending = true;
    console.log(`Toggling favorite for house ID ${houseId}`);

    this.houseService.toggleFavorite(houseId, 'house').subscribe({
      next: () => this.fetchHouseData(houseId),
      error: (error) => {
        console.error(
          `Error toggling favorite for house ID ${houseId}:`,
          error
        );
        this.fetchHouseData(houseId);
      },
      complete: () => {
        house.pending = false;
        console.log(`Completed favorite toggle for house ID ${houseId}`);
      },
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
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    const house = this.houses.find((h) => h.id === houseId);
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
      },
    });
  }
  private fetchHouseData(houseId: number): void {
    console.log(`Fetching updated data for house ID ${houseId}...`);

    this.houseService.getHouseById(houseId.toString()).subscribe({
      next: (response) => {
        const houseIndex = this.houses.findIndex((h) => h.id === houseId);
        if (houseIndex > -1 && response.result) {
          const updatedHouse = response.result;
          this.houses[houseIndex] = {
            ...this.houses[houseIndex],
            likeCount: updatedHouse.likeCount,
            likeable: updatedHouse.likeable,
            favoriteable: updatedHouse.favoriteable,
            pending: false,
          };
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error(
          `Error fetching latest data for house ID ${houseId}:`,
          error
        );
      },
    });
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

    const room = this.rooms.find((h) => h.id === roomId);
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
  private fetchRoomData(roomId: number): void {
    console.log(`Fetching updated data for room ID ${roomId}...`);

    this.roomService.getRoomById(roomId.toString()).subscribe({
      next: (response) => {
        const roomIndex = this.rooms.findIndex((h) => h.id === roomId);
        if (roomIndex > -1 && response.result) {
          const updatedRoom = response.result;
          this.rooms[roomIndex] = {
            ...this.rooms[roomIndex],
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
  likeLand(landId: number): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to like this land.',
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

    const land = this.lands.find((h) => h.id === landId);
    if (!land || land.pending) return;

    land.pending = true;
    console.log(`Toggling like for land ID ${landId}`);

    this.landervice.likeLand(landId, 'land').subscribe({
      next: () => this.fetchLandData(landId),
      error: (error) => {
        console.error(`Error toggling like for land ID ${landId}:`, error);
        this.fetchLandData(landId);
      },
      complete: () => {
        console.log(`Completed like toggle for land ID ${landId}`);
        land.pending = false;
      },
    });
  }
  private fetchLandData(landId: number): void {
    console.log(`Fetching updated data for land ID ${landId}...`);

    this.landervice.getLandById(landId.toString()).subscribe({
      next: (response) => {
        const landIndex = this.lands.findIndex((h) => h.id === landId);
        if (landIndex > -1 && response.result) {
          const updatedLand = response.result;
          this.lands[landIndex] = {
            ...this.lands[landIndex],
            likeCount: updatedLand.likeCount,
            likeable: updatedLand.likeable,
            favoriteable: updatedLand.favoriteable,
            pending: false,
          };
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error(
          `Error fetching latest data for land ID ${landId}:`,
          error
        );
      },
    });
  }
  toggleFavoriteRoom(roomId: number): void {
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
    const room = this.rooms.find((h) => h.id === roomId);
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
  toggleFavoriteland(landId: number): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to favorite this land.',
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
    const land = this.lands.find((h) => h.id === landId);
    if (!land || land.pending) return;

    land.pending = true;
    console.log(`Toggling favorite for land ID ${landId}`);

    this.landervice.toggleFavorite(landId, 'land').subscribe({
      next: () => this.fetchLandData(landId),
      error: (error) => {
        console.error(`Error toggling favorite for land ID ${landId}:`, error);
        this.fetchLandData(landId);
      },
      complete: () => {
        land.pending = false;
        console.log(`Completed favorite toggle for land ID ${landId}`);
      },
    });
  }
  onBannerClick(): void {
    const currentImage = this.images[this.currentImageIndex];
    if (currentImage.route) {
      this.router.navigate([currentImage.route]);
    }
  }
  getSlideClass(index: number): string {
    // Case 1: Active slide
    if (index === this.currentImageIndex) {
      return 'active';
    }

    // Case 2: Previous slide
    // This handles wrapping from 1st image to the last when navigating backwards
    if (
      index ===
      (this.currentImageIndex - 1 + this.images.length) % this.images.length
    ) {
      return 'previous';
    }

    // Case 3: Next slide
    // This handles wrapping from last image back to the first when navigating forwards
    if (index === (this.currentImageIndex + 1) % this.images.length) {
      return 'next';
    }

    // Case 4: Hidden slides
    return ''; // No class for other slides
  }
}
