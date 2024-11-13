import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  DomSanitizer,
  SafeResourceUrl,
  SafeUrl,
} from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { LandService } from 'src/app/add-post/add-post-land/land.service';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { VillageService } from 'src/app/address/village.service';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { ImageDialogComponent } from 'src/app/details/image-dialog.component';
import { ShareOverlayComponent } from 'src/app/details/share-overlay/share-overlay.component';
import {
  CommentData,
  UpdateCommentDialogComponent,
} from 'src/app/details/update-comment-dialog/update-comment-dialog.component';
import Swal from 'sweetalert2';

const defaultIcon = L.icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

interface Land {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  landSize: number;
  phoneNumber: string;
  imagePath: string;
  imagePaths: string[];
  safeImagePath?: SafeUrl; // Safe image URL after sanitization
  likeCount: number;
  linkMap: string;
  viewCount: number;
  safeImagePaths?: SafeUrl[];
  createdAt: string;
  province: number;
  district: number;
  commune: number;
  village: number;
  user: User;
  favoriteable: boolean;
  currentImageIndex: number;
}
interface UserComment {
  id: number;
  userId: number;
  name: string;
  description: string;
  imagePath: string;
  replies: UserReply[];
  totalReply: number;
}
interface User {
  id: number;
  fullName: string;
  gender: string;
  email: string;
  username: string;
  postCount: number;
  image: string;
  createdAt: string;
}

interface UserReply {
  id: number;
  userId: number;
  name: string;
  description: string;
  imagePath: string;
  replies: UserReply[];
  totalReply: number;
}
interface Location {
  id: number;
  englishName: string;
  khmerName: string;
}
interface AmenityCounts {
  bankCount: number;
  gymCount: number;
  restaurantCount: number;
  hotelCount: number;
  barPubCount: number;
  cafeCount: number;
  hospitalCount: number;
  supermarketCount: number;
}

interface PaggingModel<T> {
  totalPage: number;
  totalElements: number;
  currentPage: number;
  result: T[];
}

@Component({
  selector: 'app-detail-land',
  templateUrl: './detail-land.component.html',
  styleUrls: ['./detail-land.component.css'],
})
export class DetailLandComponent
  implements OnInit, AfterViewInit, AmenityCounts
{
  lande: Land | null = null;
  landId!: number;
  land: any[] = [];
  selectedImage: SafeUrl | null = null;
  provinceName: string = '';
  districtName: string = '';
  communeName: string = '';
  villageName: string = '';
  currentImage: SafeUrl | null = null;
  urlSafe!: SafeResourceUrl;
  linkMap: string | null = null;
  comments: UserComment[] = [];
  replyText: { [key: number]: string } = {};
  newCommentText: string = '';
  activeMenu: number | null = null;

  map: L.Map | null = null;
  userMarker: any;
  markers: L.Marker[] = [];
  isMapInitialized: boolean = false;

  currentPage = 0;
  totalPages = 1;
  itemsPerPage = 12;

  bankCount: number = 0;
  gymCount: number = 0;
  restaurantCount: number = 0;
  hotelCount: number = 0;
  barPubCount: number = 0;
  cafeCount: number = 0;
  hospitalCount: number = 0;
  supermarketCount: number = 0;

  loading: boolean = false;

  isLoading: boolean = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    private landService: LandService,
    private readonly dialog: MatDialog,
    private readonly districtService: DistrictService,
    private readonly communeService: CommuneService,
    private readonly villageService: VillageService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
    private snackBar: MatSnackBar
  ) {
    this.setDefaultMapUrl();
  }
  ngOnInit(): void {
    this.landId = +this.route.snapshot.paramMap.get('id')!;
    this.fetchHouseDetails();
    this.loadRelatedHouses();
    // Extract or use default coordinates to fetch nearby locations on page load
    this.landId = +this.route.snapshot.paramMap.get('id')!;
    const landIdParam = this.route.snapshot.paramMap.get('id');
    const landId = landIdParam ? parseInt(landIdParam, 10) : null;

    if (landId) {
      this.getLandDetails(landId); // Fetch house details and link map
      this.loadComments(landId); // Load comments for the house

      // Fetch and display nearby locations when coordinates are available
      if (this.lande?.linkMap) {
        const coordinates = this.extractCoordinates(this.lande.linkMap);
        if (coordinates) {
          this.fetchAndDisplayNearbyLocations(coordinates.lat, coordinates.lng);
        }
      } else {
        // Use default coordinates if no specific linkMap is available
        this.fetchAndDisplayNearbyLocations(11.5564, 104.9282);
      }
    } else {
      console.error('Invalid house ID');
    }
  }

  loadComments(landId: number): void {
    this.landService.getComments(landId).subscribe(
      (response) => {
        if (response.code === 200) {
          this.comments = response.result.result as UserComment[];
        }
      },
      (error) => {
        console.error('Error loading comments:', error);
      }
    );
  }

  postComment(): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to post a comment.',
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
    if (!this.newCommentText.trim()) return;

    const landId = this.lande?.id ?? 34;
    const type = 'land';
    const description = this.newCommentText;

    this.landService.postComment(landId, description, type).subscribe(
      (response) => {
        if (response) {
          this.loadComments(landId); // Reload comments to fetch latest data
          this.newCommentText = ''; // Clear input field
        }
      },
      (error) => {
        console.error('Error posting comment:', error);
      }
    );
  }

  sendReply(commentId: number): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to reply to this comment.',
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

    const description = this.replyText[commentId];
    if (!description) return;

    this.landService.replyToComment(commentId, description).subscribe(
      (response) => {
        if (response) {
          const landId = this.lande?.id ?? 34;
          this.loadComments(landId); // Reload comments to fetch latest data
          this.replyText[commentId] = ''; // Clear reply input
        }
      },
      (error) => {
        console.error('Error posting reply:', error);
      }
    );
  }
  openUpdateDialog(comment: UserComment | UserReply): void {
    const dialogRef = this.dialog.open(UpdateCommentDialogComponent, {
      width: '400px',
      data: { id: comment.id, description: comment.description },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateComment(result); // Call the method to update the comment
      }
    });
  }

  updateComment(updatedComment: CommentData): void {
    const updateData = {
      id: updatedComment.id,
      description: updatedComment.description,
      landId: this.lande?.id ?? null, // Replace with actual houseId if necessary
      type: 'land', // or 'land'/'room' as per requirement
    };

    this.landService.updateComment(updateData.id, updateData).subscribe(
      () => {
        const comment = this.comments.find((c) => c.id === updatedComment.id);
        if (comment) {
          comment.description = updatedComment.description; // Update in the local data
        }
      },
      (error) => {
        console.error('Error updating comment:', error);

        // Display snackbar with the error message from the API response
        const errorMessage =
          error.error?.message || 'Sorry you can update only your own comnment';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'], // Optional: custom class for error styling
        });
      }
    );
  }

  toggleMenu(commentId: number): void {
    this.activeMenu = this.activeMenu === commentId ? null : commentId;
  }

  deleteComment(commentId: number): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to delete a comment.',
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return; // Exit if the user is not logged in
    }

    this.landService.deleteComment(commentId).subscribe(
      () => {
        const landId = this.lande?.id ?? 34;
        this.loadComments(landId); // Reload comments to update the list
        this.activeMenu = null;
      },
      (error) => {
        console.error('Sorry you can delete only your own comnment');

        // Show a snackbar with the exact error message from the API response
        const errorMessage =
          error.error?.message || 'Sorry you can delete only your own comnment';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000, // Snackbar duration in milliseconds
          panelClass: ['error-snackbar'], // Optional: custom class for styling
        });
      }
    );
  }

  ngAfterViewInit(): void {
    if (this.lande && this.lande.linkMap) {
      const coordinates = this.extractCoordinates(this.lande.linkMap);
      if (coordinates) {
        this.initializeMap(coordinates.lat, coordinates.lng);
      }
    }
  }

  getLandDetails(id: number): void {
    this.landService.getLandById(id.toString()).subscribe(
      (response) => {
        this.lande = response.result as Land;
        if (this.lande) {
          this.loadImages(this.lande); // Load images if required
          this.fetchLocationDetails(
            this.lande.province,
            this.lande.district,
            this.lande.commune,
            this.lande.village
          );

          // Check and set the linkMap
          if (this.lande.linkMap) {
            // Log linkMap to ensure it's being received
            console.log('Original land linkMap:', this.lande.linkMap);

            // Check if linkMap is in the format of coordinates (e.g., "11.5564,104.9282")
            const isCoordinates = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(
              this.lande.linkMap
            );
            this.linkMap = isCoordinates
              ? `https://www.google.com/maps?q=${this.lande.linkMap}`
              : this.lande.linkMap;

            // Log formatted linkMap to ensure correct format
            console.log('Formatted linkMap:', this.linkMap);

            // Sanitize URL for embedding
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
              `${this.linkMap}&output=embed`
            );
          } else {
            console.warn('No linkMap provided for this land');
          }

          console.log('Fetched updated land details:', this.lande);
        }
        this.cdr.detectChanges(); // Ensure the view updates after fetching
      },
      (error) => {
        console.error('Error fetching land details:', error);
      }
    );
  }

  setDefaultMapUrl(): void {
    // Set the default map to Phnom Penh coordinates if no specific link is available
    const url = `https://maps.google.com/maps?q=11.5564,104.9282&z=14&output=embed`;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  setMapUrl(): void {
    // Set the URL to display Phnom Penh, Cambodia, on the map
    const url = `https://maps.google.com/maps?q=11.5564,104.9282&z=14&output=embed`;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  extractCoordinates(linkMap: string): { lat: number; lng: number } | null {
    const match = linkMap.match(/q=([-.\d]+),([-.\d]+)/);
    return match
      ? { lat: parseFloat(match[1]), lng: parseFloat(match[2]) }
      : null;
  }

  initializeMap(lat: number, lng: number): void {
    if (!this.map) {
      setTimeout(() => {
        const mapContainer = document.getElementById('house-map');
        if (!mapContainer) {
          console.error('Map container not found.');
          return;
        }

        // Initialize the map centered on the property
        this.map = L.map('house-map').setView([lat, lng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(this.map);

        // Place a marker at the property location
        L.marker([lat, lng])
          .addTo(this.map)
          .bindPopup('Property Location')
          .openPopup();

        // Fetch and display nearby locations
        this.fetchAndDisplayNearbyLocations(lat, lng);
      }, 0);
    }
  }

  fetchAndDisplayNearbyLocations(lat: number, lng: number): void {
    const amenities = [
      { type: 'bank', countProp: 'bankCount' },
      { type: 'gym', countProp: 'gymCount' },
      { type: 'restaurant', countProp: 'restaurantCount' },
      { type: 'hotel', countProp: 'hotelCount' },
      { type: 'bar', countProp: 'barPubCount' },
      { type: 'pub', countProp: 'barPubCount' },
      { type: 'cafe', countProp: 'cafeCount' },
      { type: 'hospital', countProp: 'hospitalCount' },
      { type: 'supermarket', countProp: 'supermarketCount' },
    ];

    amenities.forEach((amenity) => {
      const query = `
          [out:json][timeout:25];
          node(around:1000, ${lat}, ${lng})["amenity"="${amenity.type}"];
          out center 10;  // Limit to 10 actual amenities of this type
        `;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        query
      )}`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const count = data.elements ? data.elements.length : 0;
          (this as any)[amenity.countProp] = count; // Update specific count property
          this.displayNearbyPlaces(data.elements, amenity.type);
          this.cdr.detectChanges(); // Update UI counts
        })
        .catch((error) => {
          console.error(
            `Error fetching nearby ${amenity.type} locations:`,
            error
          );
        });
    });
  }

  displayNearbyPlaces(places: any[], amenity: string): void {
    if (!this.map) {
      console.error('Map is not initialized.');
      return;
    }

    console.log(
      `Displaying ${places.length} nearby ${amenity} places on the map.`
    );
    places.forEach((place) => {
      if (place.lat && place.lon) {
        const marker = L.marker([place.lat, place.lon]).addTo(
          this.map as L.Map
        );
        marker.bindPopup(
          `<b>${place.tags.name || 'Unnamed'}</b><br>Type: ${amenity}`
        );
        this.markers.push(marker);
      } else {
        console.log(`Skipping place without coordinates:`, place);
      }
    });
  }

  fetchHouseDetails(): void {
    this.landService.getLandById(this.landId.toString()).subscribe({
      next: (response) => {
        this.lande = response.result;
        if (this.lande) {
          this.loadCardImages(this.lande);
          this.fetchLocationDetails(
            this.lande.province,
            this.lande.district,
            this.lande.commune,
            this.lande.village
          );
          if (this.lande.linkMap) {
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
              `${this.lande.linkMap}&output=embed`
            );
          }
          console.log('Fetched updated house details:', this.lande);
        }
        this.cdr.detectChanges(); // Ensure the view updates after fetching
      },
      error: (error) => {
        console.error(
          `Error fetching house details for ID ${this.landId}:`,
          error
        );
      },
    });
  }

  toggleFavorite(): void {
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

    console.log(`Attempting to toggle favorite for house ID: ${this.landId}`);

    this.landService.toggleFavorite(this.landId, 'house').subscribe({
      next: () => {
        // Toggle the 'favoriteable' status locally without blocking future clicks
        if (this.lande) {
          this.lande.favoriteable = !this.lande.favoriteable;
        }
        console.log(
          `Successfully toggled favorite for house ID ${this.landId}`
        );
        this.getLandDetails(this.landId); // Re-fetch details to confirm state
      },
      error: (error) => {
        console.warn(
          `Toggling favorite encountered an error. Assuming success. Error:`,
          error
        );
        // Toggle locally regardless of error, for smooth UI
        if (this.lande) {
          this.lande.favoriteable = !this.lande.favoriteable;
        }
      },
    });
  }

  openShareOverlay(): void {
    this.dialog.open(ShareOverlayComponent, {
      width: '100%',
      maxWidth: '400px',
    });
  }

  loadImages(land: Land): void {
    if (land.imagePaths && land.imagePaths.length > 0) {
      land.safeImagePaths = []; // Clear existing paths

      // Track the loading order to set the first image consistently
      let imagesLoaded = 0;

      land.imagePaths.forEach((imagePath, index) => {
        this.landService.getImage(imagePath).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            land.safeImagePaths!.push(safeUrl);

            imagesLoaded++;

            // Set `currentImage` and `currentImageIndex` to the first loaded image
            if (imagesLoaded === 1) {
              this.currentImage = safeUrl;
              land.currentImageIndex = 0; // Assign 0 since images are available
            }
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
    } else {
      // Handle cases with no images
      land.safeImagePaths = [];
      this.currentImage = null;
      land.currentImageIndex = -1; // Use -1 or any number indicating no images
    }
  }

  // Function to load images specifically for card houses in Related Posts
  loadCardImages(land: Land): void {
    land.safeImagePaths = []; // Clear any existing images
    land.imagePaths.forEach((imagePath) => {
      this.landService.getImage(imagePath).subscribe(
        (imageBlob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          land.safeImagePaths!.push(safeUrl);
        },
        (error) => {
          console.error('Error loading image:', error);
        }
      );
    });
    land.currentImageIndex = 0; // Set default image index
  }

  // Function to go to the previous image for a specific card house
  prevCardImage(house: Land): void {
    if (house.safeImagePaths && house.safeImagePaths.length > 1) {
      house.currentImageIndex =
        house.currentImageIndex > 0
          ? house.currentImageIndex - 1
          : house.safeImagePaths.length - 1;
    }
  }

  // Function to go to the next image for a specific card house
  nextCardImage(house: Land): void {
    if (house.safeImagePaths && house.safeImagePaths.length > 1) {
      house.currentImageIndex =
        house.currentImageIndex < house.safeImagePaths.length - 1
          ? house.currentImageIndex + 1
          : 0;
    }
  }

  openImageViewer(image: SafeUrl): void {
    this.dialog.open(ImageDialogComponent, {
      data: { image: image as string },
      panelClass: 'full-screen-modal',
    });
  }
  fetchLocationDetails(
    provinceId: number,
    districtId: number,
    communeId: number,
    villageId: number
  ): void {
    this.districtService.getProvincesPublic().subscribe((res) => {
      const paginatedResponse = res as PaggingModel<Location>;
      const provinceIdNumber = Number(provinceId); // Convert provinceId to a number

      const province = Array.isArray(paginatedResponse.result)
        ? paginatedResponse.result.find((p) => p.id === provinceIdNumber)
        : null; // Compare as numbers
      // console.log("res", res);

      // console.log('Province ID:', provinceIdNumber); // Log the ID
      // console.log('Provinces array:', paginatedResponse.result); // Log the provinces array
      // console.log('Found province:', province); // Log the found province
      // console.log('Province Khmer Name:', province ? province.khmerName : 'Not Found'); // Log the Khmer name

      console.log('province response:', province);

      this.provinceName = province
        ? province.khmerName || province.englishName
        : 'Unknown Province';
      this.cdr.detectChanges();
    });

    this.districtService.getByProvincePublic(provinceId).subscribe((res) => {
      console.log('Districts response:', res);
      const paginatedResponse = res as PaggingModel<Location>;
      const district = Array.isArray(paginatedResponse.result)
        ? paginatedResponse.result.find((d) => d.id === districtId)
        : null;
      this.districtName = district
        ? district.khmerName || district.englishName
        : 'Unknown District';
      this.cdr.detectChanges();
    });

    this.communeService.getByDistrictPublic(districtId).subscribe((res) => {
      console.log('Communes response:', res);
      const paginatedResponse = res as PaggingModel<Location>;
      const commune = Array.isArray(paginatedResponse.result)
        ? paginatedResponse.result.find((c) => c.id === communeId)
        : null;
      this.communeName = commune
        ? commune.khmerName || commune.englishName
        : 'Unknown Commune';
      this.cdr.detectChanges();
    });

    this.villageService.getByCommunePublic(communeId).subscribe((res) => {
      console.log('Villages response:', res);
      const paginatedResponse = res as PaggingModel<Location>;
      const village = Array.isArray(paginatedResponse.result)
        ? paginatedResponse.result.find((v) => v.id === villageId)
        : null;
      this.villageName = village
        ? village.khmerName || village.englishName
        : 'Unknown Village';
      this.cdr.detectChanges();
    });
  }

  openImageInFullScreen(image: SafeUrl): void {
    this.dialog.open(ImageDialogComponent, {
      data: { image },
      panelClass: 'full-screen-modal',
    });
  }
  previousImage(): void {
    if (this.lande && this.lande.safeImagePaths) {
      const index = this.lande.safeImagePaths.indexOf(this.currentImage!);
      if (index > 0) {
        this.currentImage = this.lande.safeImagePaths[index - 1];
      }
    }
  }

  nextImage(): void {
    if (this.lande && this.lande.safeImagePaths) {
      const index = this.lande.safeImagePaths.indexOf(this.currentImage!);
      if (index < this.lande.safeImagePaths.length - 1) {
        this.currentImage = this.lande.safeImagePaths[index + 1];
      }
    }
  }
  selectImage(image: SafeUrl): void {
    this.currentImage = image;
  }

  goBack(): void {
    window.history.back();
  }

  loadSafeImagePaths(house: Land): SafeUrl[] {
    return house.imagePaths.map((path) =>
      this.sanitizer.bypassSecurityTrustUrl(path)
    );
  }

  loadRelatedHouses(page: number = 0): void {
    this.loading = true;
    this.landService.getLand({ page, size: this.itemsPerPage }).subscribe(
      (response) => {
        const responseData = response.result;
        this.land = responseData.result;
        this.totalPages = responseData.totalPage;

        // Call loadImage for each house to load its images
        this.land.forEach((house) => {
          this.loadImage(house);
        });

        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('Error loading houses:', error);
      }
    );
  }

  loadImage(land: any): void {
    if (land.imagePaths && land.imagePaths.length > 0) {
      land.safeImagePaths = [];
      land.imagePaths.forEach((imageUrl: string) => {
        this.landService.getImage(imageUrl).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            land.safeImagePaths.push(safeUrl);
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
      land.currentImageIndex = 0;
    } else {
      land.safeImagePaths = [];
      land.currentImageIndex = 0;
    }
  }

  prevImage1(house: Land): void {
    // Check if safeImagePaths exists and has images
    if (house.safeImagePaths && house.safeImagePaths.length > 1) {
      house.currentImageIndex =
        house.currentImageIndex > 0
          ? house.currentImageIndex - 1
          : house.safeImagePaths.length - 1;
    }
  }

  nextImage1(house: Land): void {
    // Check if safeImagePaths exists and has images
    if (house.safeImagePaths && house.safeImagePaths.length > 1) {
      house.currentImageIndex =
        house.currentImageIndex < house.safeImagePaths.length - 1
          ? house.currentImageIndex + 1
          : 0;
    }
  }

  likeHouse(landId: number): void {
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

    const house = this.land.find((h) => h.id === landId);
    if (!house || house.pending) return;

    house.pending = true;
    console.log(`Toggling like for house ID ${landId}`);

    // Provide the `postType` argument, such as 'house' or another applicable value.
    this.landService.likeLand(landId, 'house').subscribe({
      next: () => this.fetchHouseData(landId),
      error: (error) => {
        console.error(`Error toggling like for house ID ${landId}:`, error);
        this.fetchHouseData(landId);
      },
      complete: () => {
        console.log(`Completed like toggle for house ID ${landId}`);
        house.pending = false;
      },
    });
  }

  toggleFavorite1(landId: number): void {
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

    const house = this.land.find((h) => h.id === landId);
    if (!house || house.pending) return;

    house.pending = true;
    console.log(`Toggling favorite for house ID ${landId}`);

    this.landService.toggleFavorite(landId, 'house').subscribe({
      next: () => this.fetchHouseData(landId),
      error: (error) => {
        console.error(`Error toggling favorite for house ID ${landId}:`, error);
        this.fetchHouseData(landId);
      },
      complete: () => {
        house.pending = false;
        console.log(`Completed favorite toggle for house ID ${landId}`);
      },
    });
  }

  updateHouseData(landId: number): void {
    this.landService.getLandById(landId.toString()).subscribe({
      next: (response) => {
        const updatedHouse = response.result;
        const index = this.land.findIndex((h) => h.id === landId);
        if (index !== -1) {
          this.land[index] = {
            ...this.land[index],
            likeCount: updatedHouse.likeCount,
            likeable: updatedHouse.likeable,
            favoriteable: updatedHouse.favoriteable,
            pending: false,
          };
        }
      },
      error: (error) => {
        console.error(`Error updating data for house ID ${landId}:`, error);
      },
    });
  }

  goToDetails(landId: number): void {
    this.router.navigate(['/details', landId]);
  }
  goToDetails1(landId: number): void {
    this.router.navigate(['/details', landId]).then(() => {
      window.location.reload();
      // this.fetchHouseDetails();
    });
  }

  private fetchHouseData(landId: number): void {
    console.log(`Fetching updated data for house ID ${landId}...`);

    this.landService.getLandById(landId.toString()).subscribe({
      next: (response) => {
        const houseIndex = this.land.findIndex((h) => h.id === landId);
        if (houseIndex > -1 && response.result) {
          const updatedHouse = response.result;
          this.land[houseIndex] = {
            ...this.land[houseIndex],
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
          `Error fetching latest data for house ID ${landId}:`,
          error
        );
      },
    });
  }
}
