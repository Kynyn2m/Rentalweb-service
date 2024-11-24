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
  selectedAmenity: string | null = null;
  amenitiesCount: { [key: string]: number } = {};
  landeId!: number;
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
  amenityCache: { [key: string]: any[] } = {};
  isLoadingAmenity: boolean = false;

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

  amenities = [
    { type: 'cafe', label: 'Cafes', countProp: 'cafeCount', icon: 'fa-coffee' },
    { type: 'pub', label: 'Pubs', countProp: 'barPubCount', icon: 'fa-beer' },
    {
      type: 'restaurant',
      label: 'Restaurants',
      countProp: 'restaurantCount',
      icon: 'fa-utensils',
    },
    {
      type: 'hotel',
      label: 'Hotels',
      countProp: 'hotelCount',
      icon: 'fa-hotel',
    },
    {
      type: 'bank',
      label: 'Banks',
      countProp: 'bankCount',
      icon: 'fa-university',
    },
    { type: 'gym', label: 'Gyms', countProp: 'gymCount', icon: 'fa-dumbbell' },
    {
      type: 'hospital',
      label: 'Hospitals',
      countProp: 'hospitalCount',
      icon: 'fa-hospital',
    },
    {
      type: 'supermarket',
      label: 'Supermarkets',
      countProp: 'supermarketCount',
      icon: 'fa-shopping-cart',
    },
  ];

  loading: boolean = false;

  isLoading: boolean = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    private readonly landService: LandService,
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
    this.landeId = +this.route.snapshot.paramMap.get('id')!;
    this.fetchLandeDetails();
    this.loadRelatedLand();
    // Extract or use default coordinates to fetch nearby locations on page load
    this.landeId = +this.route.snapshot.paramMap.get('id')!;
    const landeIdParam = this.route.snapshot.paramMap.get('id');
    const landeId = landeIdParam ? parseInt(landeIdParam, 10) : null;

    if (landeId) {
      this.goToLand(landeId); // Fetch lande details
      this.loadComments(landeId);
    } else {
      console.error('Invalid lande ID');
    }
  }

  loadComments(landeId: number): void {
    this.landService.getComments(landeId).subscribe(
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

    const landeId = this.lande?.id ?? 34;
    const type = 'land';
    const description = this.newCommentText;

    this.landService.postComment(landeId, description, type).subscribe(
      (response) => {
        if (response) {
          this.loadComments(landeId); // Reload comments to fetch latest data
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
          const landeId = this.lande?.id ?? 34;
          this.loadComments(landeId); // Reload comments to fetch latest data
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
      landeId: this.lande?.id ?? null, // Replace with actual landeId if necessary
      type: 'lande', // or 'land'/'land' as per requirement
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
        const landeId = this.lande?.id ?? 34;
        this.loadComments(landeId); // Reload comments to update the list
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
    const landeIdParam = this.route.snapshot.paramMap.get('id');
    const landeId = landeIdParam ? parseInt(landeIdParam, 10) : null;

    if (landeId) {
      this.goToLand(landeId);
    }
  }
  goToDetails1(houseId: number): void {
    this.router.navigate(['/details', houseId]).then(() => {
      window.location.reload();
      // this.fetchHouseDetails();
    });
  }
  goToLand(id: number): void {
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
          const coordinates = this.extractCoordinates(this.lande.linkMap);
          if (coordinates) {
            this.initializeMap(coordinates.lat, coordinates.lng);
            this.fetchAllNearbyCounts(coordinates.lat, coordinates.lng); // Fetch counts for all amenities
          }
        }
        this.cdr.detectChanges();
      },
      (error) => console.error('Error fetching lande details:', error)
    );
  }

  fetchAllNearbyCounts(lat: number, lng: number): void {
    const promises = this.amenities.map((amenity) =>
      fetch(this.getOverpassUrl(lat, lng, amenity.type))
        .then((response) => response.json())
        .then((data) => {
          this.amenitiesCount[amenity.type] = data.elements.length; // Store the count
        })
        .catch((error) => {
          console.error(`Error fetching ${amenity.type} count:`, error);
          this.amenitiesCount[amenity.type] = 0;
        })
    );

    Promise.all(promises).then(() => {
      console.log('All nearby amenity counts fetched:', this.amenitiesCount);
      this.cdr.detectChanges(); // Update the UI
    });
  }

  getOverpassUrl(lat: number, lng: number, amenityType: string): string {
    const query = `
      [out:json][timeout:10];
      node(around:1000, ${lat}, ${lng})["amenity"="${amenityType}"];
      out center;
    `;
    return `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
      query
    )}`;
  }

  fetchAndDisplayNearbyLocations(
    lat: number,
    lng: number,
    amenityType: string
  ): Promise<void> {
    // Use cached data if available
    if (this.amenityCache[amenityType]) {
      console.log(`Using cached data for ${amenityType}`);
      this.updateMarkers(this.amenityCache[amenityType], amenityType);
      return Promise.resolve();
    }

    const query = `
      [out:json][timeout:10];
      node(around:1000, ${lat}, ${lng})["amenity"="${amenityType}"];
      out center 10;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
      query
    )}`;

    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(`Fetched ${data.elements.length} ${amenityType}(s).`);
        this.amenitiesCount[amenityType] = data.elements.length;
        this.amenityCache[amenityType] = data.elements; // Cache the results
        this.updateMarkers(data.elements, amenityType);
      })
      .catch((error) => {
        console.error(`Error fetching ${amenityType}:`, error);
        this.amenitiesCount[amenityType] = 0;
      });
  }

  updateMarkers(places: any[], amenityType: string): void {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach((marker) => this.map?.removeLayer(marker));
    this.markers = [];

    // Add new markers
    places.forEach((place) => {
      if (place.lat && place.lon) {
        const marker = L.marker([place.lat, place.lon]).addTo(this.map!);
        marker.bindPopup(
          `<b>${place.tags.name || 'Unnamed'}</b><br>Type: ${amenityType}`
        );
        this.markers.push(marker);
      }
    });
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
    if (this.map) return;

    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Map container not found.');
      return;
    }

    this.map = L.map('map').setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    L.marker([lat, lng], { icon: defaultIcon })
      .addTo(this.map)
      .bindPopup('Lande Location')
      .openPopup();
  }

  fetchAndDisplayNearbyPlaces(
    lat: number,
    lng: number,
    amenityType: string
  ): void {
    const query = `
      [out:json][timeout:25];
      node(around:1000, ${lat}, ${lng})["amenity"="${amenityType}"];
      out center 10;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
      query
    )}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Update count and display pins
        this.amenitiesCount[amenityType] = data.elements.length;
        this.displayMarkers(data.elements, amenityType);
      })
      .catch((error) => console.error(`Error fetching ${amenityType}:`, error));
  }

  displayMarkers(places: any[], amenityType: string): void {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach((marker) => this.map?.removeLayer(marker));
    this.markers = [];

    // Add new markers
    places.forEach((place) => {
      if (place.lat && place.lon) {
        const marker = L.marker([place.lat, place.lon]).addTo(this.map!);
        marker.bindPopup(
          `<b>${place.tags.name || 'Unnamed'}</b><br>Type: ${amenityType}`
        );
        this.markers.push(marker);
      }
    });
  }
  navigateToContact(): void {
    this.router.navigate(['/contact']); // Replace '/contact' with your desired route
  }

  onAmenityClick(amenityType: string): void {
    if (this.selectedAmenity === amenityType) {
      console.log(`Amenity ${amenityType} is already displayed.`);
      return; // Avoid fetching if the same amenity is already selected
    }

    this.selectedAmenity = amenityType;
    this.isLoadingAmenity = true;

    const coordinates = this.extractCoordinates(this.lande?.linkMap || '');
    if (coordinates) {
      this.fetchAndDisplayNearbyLocations(
        coordinates.lat,
        coordinates.lng,
        amenityType
      ).finally(() => {
        this.isLoadingAmenity = false; // Hide spinner after fetching
      });
    }
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

  fetchLandeDetails(): void {
    this.landService.getLandById(this.landeId.toString()).subscribe({
      next: (response) => {
        this.lande = response.result;
        if (this.lande) {
          // Load images for the land
          this.loadCardImages(this.lande);

          // Fetch location details
          this.fetchLocationDetails(
            this.lande.province,
            this.lande.district,
            this.lande.commune,
            this.lande.village
          );

          // Handle map link
          if (this.lande.linkMap && this.isValidGoogleMapsLink(this.lande.linkMap)) {
            // Sanitize and prepare the URL for embedding
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
              `${this.lande.linkMap}&output=embed`
            );
            console.log('Google Maps link validated and set:', this.lande.linkMap);
          } else {
            console.warn('Invalid or missing linkMap, using fallback URL.');
            this.lande.linkMap = this.generateDefaultGoogleMapsLink(11.5564, 104.9282);
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
              `${this.lande.linkMap}&output=embed`
            );
          }
          console.log('Fetched updated lande details:', this.lande);
        }

        // Ensure the UI updates
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(
          `Error fetching lande details for ID ${this.landeId}:`,
          error
        );
      },
    });
  }

  isValidGoogleMapsLink(link: string): boolean {
    const googleMapsRegex = /^https:\/\/(www\.)?google\.com\/maps/;
    return googleMapsRegex.test(link);
  }
  generateDefaultGoogleMapsLink(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }


  toggleFavorite(): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to favorite this lande.',
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

    console.log(`Attempting to toggle favorite for lande ID: ${this.landeId}`);

    this.landService.toggleFavorite(this.landeId, 'lande').subscribe({
      next: () => {
        // Toggle the 'favoriteable' status locally without blocking future clicks
        if (this.lande) {
          this.lande.favoriteable = !this.lande.favoriteable;
        }
        console.log(
          `Successfully toggled favorite for lande ID ${this.landeId}`
        );
        this.goToLand(this.landeId); // Re-fetch details to confirm state
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

  loadImages(lande: Land): void {
    if (lande.imagePaths && lande.imagePaths.length > 0) {
      lande.safeImagePaths = []; // Clear existing paths

      // Track the loading order to set the first image consistently
      let imagesLoaded = 0;

      lande.imagePaths.forEach((imagePath, index) => {
        this.landService.getImage(imagePath).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            lande.safeImagePaths!.push(safeUrl);

            imagesLoaded++;

            // Set `currentImage` and `currentImageIndex` to the first loaded image
            if (imagesLoaded === 1) {
              this.currentImage = safeUrl;
              lande.currentImageIndex = 0; // Assign 0 since images are available
            }
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
    } else {
      // Handle cases with no images
      lande.safeImagePaths = [];
      this.currentImage = null;
      lande.currentImageIndex = -1; // Use -1 or any number indicating no images
    }
  }

  // Function to load images specifically for card land in Related Posts
  loadCardImages(lande: Land): void {
    lande.safeImagePaths = []; // Clear any existing images
    lande.imagePaths.forEach((imagePath) => {
      this.landService.getImage(imagePath).subscribe(
        (imageBlob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          lande.safeImagePaths!.push(safeUrl);
        },
        (error) => {
          console.error('Error loading image:', error);
        }
      );
    });
    lande.currentImageIndex = 0; // Set default image index
  }

  // Function to go to the previous image for a specific card lande
  prevCardImage(lande: Land): void {
    if (lande.safeImagePaths && lande.safeImagePaths.length > 1) {
      lande.currentImageIndex =
        lande.currentImageIndex > 0
          ? lande.currentImageIndex - 1
          : lande.safeImagePaths.length - 1;
    }
  }

  // Function to go to the next image for a specific card lande
  nextCardImage(lande: Land): void {
    if (lande.safeImagePaths && lande.safeImagePaths.length > 1) {
      lande.currentImageIndex =
        lande.currentImageIndex < lande.safeImagePaths.length - 1
          ? lande.currentImageIndex + 1
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
    console.log('Fetching location details for:', { provinceId, districtId, communeId, villageId });

    // Fetch province details
    this.districtService.getProvincesPublic().subscribe(
      (res) => {
        const provinces = res?.result?.result || res?.result || [];
        console.log('Provinces response:', provinces);

        const province = provinces.find((p: any) => p.id === provinceId);
        this.provinceName = province ? province.khmerName || province.englishName : 'Unknown Province';
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching provinces:', error);
        this.provinceName = 'Error Loading Province';
        this.cdr.detectChanges();
      }
    );

    // Fetch district details
    this.districtService.getByProvincePublic(provinceId).subscribe(
      (res) => {
        const districts = res?.result?.result || res?.result || [];
        console.log('Districts response:', districts);

        const district = districts.find((d: any) => d.id === districtId);
        this.districtName = district ? district.khmerName || district.englishName : 'Unknown District';
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching districts:', error);
        this.districtName = 'Error Loading District';
        this.cdr.detectChanges();
      }
    );

    // Fetch commune details
    this.communeService.getByDistrictPublic(districtId).subscribe(
      (res) => {
        const communes = res?.result?.result || res?.result || [];
        console.log('Communes response:', communes);

        const commune = communes.find((c: any) => c.id === communeId);
        this.communeName = commune ? commune.khmerName || commune.englishName : 'Unknown Commune';
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching communes:', error);
        this.communeName = 'Error Loading Commune';
        this.cdr.detectChanges();
      }
    );

    // Fetch village details
    this.villageService.getByCommunePublic(communeId).subscribe(
      (res) => {
        const villages = res?.result?.result || res?.result || [];
        console.log('Villages response:', villages);

        const village = villages.find((v: any) => v.id === villageId);
        this.villageName = village ? village.khmerName || village.englishName : 'Unknown Village';
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching villages:', error);
        this.villageName = 'Error Loading Village';
        this.cdr.detectChanges();
      }
    );
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

  loadSafeImagePaths(lande: Land): SafeUrl[] {
    return lande.imagePaths.map((path) =>
      this.sanitizer.bypassSecurityTrustUrl(path)
    );
  }

  loadRelatedLand(page: number = 0): void {
    this.loading = true;
    this.landService.getLand({ page, size: this.itemsPerPage }).subscribe(
      (response) => {
        const responseData = response.result;
        this.land = responseData.result;
        this.totalPages = responseData.totalPage;

        // Call loadImage for each land to load its images
        this.land.forEach((land) => {
          this.loadImage(land);
        });

        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('Error loading land:', error);
      }
    );
  }

  loadImage(lande: any): void {
    if (lande.imagePaths && lande.imagePaths.length > 0) {
      lande.safeImagePaths = [];
      lande.imagePaths.forEach((imageUrl: string) => {
        this.landService.getImage(imageUrl).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            lande.safeImagePaths.push(safeUrl);
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
      lande.currentImageIndex = 0;
    } else {
      lande.safeImagePaths = [];
      lande.currentImageIndex = 0;
    }
  }

  prevImage1(lande: Land): void {
    // Check if safeImagePaths exists and has images
    if (lande.safeImagePaths && lande.safeImagePaths.length > 1) {
      lande.currentImageIndex =
        lande.currentImageIndex > 0
          ? lande.currentImageIndex - 1
          : lande.safeImagePaths.length - 1;
    }
  }

  nextImage1(lande: Land): void {
    // Check if safeImagePaths exists and has images
    if (lande.safeImagePaths && lande.safeImagePaths.length > 1) {
      lande.currentImageIndex =
        lande.currentImageIndex < lande.safeImagePaths.length - 1
          ? lande.currentImageIndex + 1
          : 0;
    }
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

    const land = this.land.find((h) => h.id === landId);
    if (!land || land.pending) return;

    land.pending = true;
    console.log(`Toggling like for land ID ${landId}`);

    // Provide the `postType` argument, such as 'land' or another applicable value.
    this.landService.likeLand(landId, 'land').subscribe({
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

  toggleFavorite1(landId: number): void {
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

    const land = this.land.find((h) => h.id === landId);
    if (!land || land.pending) return;

    land.pending = true;
    console.log(`Toggling favorite for land ID ${landId}`);

    this.landService.toggleFavorite(landId, 'land').subscribe({
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

  updateLandData(landId: number): void {
    this.landService.getLandById(landId.toString()).subscribe({
      next: (response) => {
        const updatedLand = response.result;
        const index = this.land.findIndex((h) => h.id === landId);
        if (index !== -1) {
          this.land[index] = {
            ...this.land[index],
            likeCount: updatedLand.likeCount,
            likeable: updatedLand.likeable,
            favoriteable: updatedLand.favoriteable,
            pending: false,
          };
        }
      },
      error: (error) => {
        console.error(`Error updating data for land ID ${landId}:`, error);
      },
    });
  }

  goToDetailsLand(landId: number): void {
    this.router.navigate(['/detail-land', landId]);
  }
  goToDetailsLand1(landId: number): void {
    this.router.navigate(['/details-land', landId]).then(() => {
      window.location.reload();
      // this.fetchLandeDetails();
    });
  }

  private fetchLandData(landId: number): void {
    console.log(`Fetching updated data for land ID ${landId}...`);

    this.landService.getLandById(landId.toString()).subscribe({
      next: (response) => {
        const landIndex = this.land.findIndex((h) => h.id === landId);
        if (landIndex > -1 && response.result) {
          const updatedLand = response.result;
          this.land[landIndex] = {
            ...this.land[landIndex],
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
}
