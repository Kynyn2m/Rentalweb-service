import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HouseService } from '../Service/house.service';
import {
  DomSanitizer,
  SafeResourceUrl,
  SafeUrl,
} from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from './image-dialog.component';
import { DistrictService } from '../address/district.service';
import { CommuneService } from '../address/commune.service';
import { VillageService } from '../address/village.service';

import Swal from 'sweetalert2';
import { AuthenticationService } from '../authentication/authentication.service';
import * as L from 'leaflet';
import { ShareOverlayComponent } from './share-overlay/share-overlay.component';
import {
  CommentData,
  UpdateCommentDialogComponent,
} from './update-comment-dialog/update-comment-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], // Size of the icon
  iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
  popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
  shadowSize: [41, 41], // Size of the shadow
});

L.Marker.prototype.options.icon = defaultIcon;


/** Interfaces */
interface House {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  width: number;
  height: number;
  floor: number;
  phoneNumber: string;
  imagePaths: string[];
  safeImagePaths?: SafeUrl[];
  likeCount: number;
  linkMap: string;
  viewCount: number;
  createdAt: string;
  province: number;
  district: number;
  commune: number;
  village: number;
  liked: boolean;
  pending?: boolean;
  user: User;
  favoriteable: boolean;
  currentImageIndex: number;
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

interface UserComment {
  id: number;
  userId: number;
  name: string;
  description: string;
  imagePath: string;
  replies: UserReply[];
  totalReply: number;
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

interface PaggingModel<T> {
  totalPage: number;
  totalElements: number;
  currentPage: number;
  result: T[];
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

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit, AfterViewInit, AmenityCounts {
  house: House | null = null;
  selectedAmenity: string | null = null;
  amenitiesCount: { [key: string]: number } = {};
  houseId!: number;
  houses: any[] = [];
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

  currentImageIndex: number = 0;


  currentPage = 0;
  totalPages = 1;
  itemsPerPage = 16;

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
    { type: 'restaurant', label: 'Restaurants', countProp: 'restaurantCount', icon: 'fa-utensils' },
    { type: 'hotel', label: 'Hotels', countProp: 'hotelCount', icon: 'fa-hotel' },
    { type: 'bank', label: 'Banks', countProp: 'bankCount', icon: 'fa-university' },
    { type: 'gym', label: 'Gyms', countProp: 'gymCount', icon: 'fa-dumbbell' },
    { type: 'hospital', label: 'Hospitals', countProp: 'hospitalCount', icon: 'fa-hospital' },
    { type: 'supermarket', label: 'Supermarkets', countProp: 'supermarketCount', icon: 'fa-shopping-cart' },
  ];



  loading: boolean = false;

  isLoading: boolean = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    private readonly houseService: HouseService,
    private readonly dialog: MatDialog,
    private readonly districtService: DistrictService,
    private readonly communeService: CommuneService,
    private readonly villageService: VillageService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.setDefaultMapUrl();
  }

  ngOnInit(): void {

    this.houseId = +this.route.snapshot.paramMap.get('id')!;
    this.fetchHouseDetails();
    this.loadRelatedHouses();
    // Extract or use default coordinates to fetch nearby locations on page load
    this.houseId = +this.route.snapshot.paramMap.get('id')!;
    const houseIdParam = this.route.snapshot.paramMap.get('id');
    const houseId = houseIdParam ? parseInt(houseIdParam, 10) : null;

    if (houseId) {
      this.getHouseDetails(houseId); // Fetch house details
      this.loadComments(houseId);
    } else {
      console.error('Invalid house ID');
    }
  }

  loadComments(houseId: number): void {
    this.houseService.getComments(houseId).subscribe(
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

    const houseId = this.house?.id ?? 34;
    const type = 'house';
    const description = this.newCommentText;

    this.houseService.postComment(houseId, description, type).subscribe(
      (response) => {
        if (response) {
          this.loadComments(houseId); // Reload comments to fetch latest data
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

    this.houseService.replyToComment(commentId, description).subscribe(
      (response) => {
        if (response) {
          const houseId = this.house?.id ?? 34;
          this.loadComments(houseId); // Reload comments to fetch latest data
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
      houseId: this.house?.id ?? null, // Replace with actual houseId if necessary
      type: 'house', // or 'land'/'room' as per requirement
    };

    this.houseService.updateComment(updateData.id, updateData).subscribe(
      () => {
        const comment = this.comments.find((c) => c.id === updatedComment.id);
        if (comment) {
          comment.description = updatedComment.description; // Update in the local data
        }
      },
      (error) => {
        console.error('Error updating comment:', error);

        // Display snackbar with the error message from the API response
        const errorMessage = error.error?.message || 'Sorry you can update only your own comnment';
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

    this.houseService.deleteComment(commentId).subscribe(
      () => {
        const houseId = this.house?.id ?? 34;
        this.loadComments(houseId); // Reload comments to update the list
        this.activeMenu = null;
      },
      (error) => {
        console.error('Sorry you can delete only your own comnment');

        // Show a snackbar with the exact error message from the API response
        const errorMessage = error.error?.message || 'Sorry you can delete only your own comnment';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000, // Snackbar duration in milliseconds
          panelClass: ['error-snackbar'], // Optional: custom class for styling
        });
      }
    );
  }


  ngAfterViewInit(): void {
    const houseIdParam = this.route.snapshot.paramMap.get('id');
    const houseId = houseIdParam ? parseInt(houseIdParam, 10) : null;

    if (houseId) {
      this.getHouseDetails(houseId);
    }
  }




  getHouseDetails(id: number): void {
    this.houseService.getHouseById(id.toString()).subscribe(
      (response) => {
        this.house = response.result as House;
        if (this.house) {
          this.loadImages(this.house); // Load images if required
          this.fetchLocationDetails(
            this.house.province,
            this.house.district,
            this.house.commune,
            this.house.village
          );
          const coordinates = this.extractCoordinates(this.house.linkMap);
          if (coordinates) {
            this.initializeMap(coordinates.lat, coordinates.lng);
            this.fetchAllNearbyCounts(coordinates.lat, coordinates.lng); // Fetch counts for all amenities
          }
        }
        this.cdr.detectChanges();
      },
      (error) => console.error('Error fetching house details:', error)
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
    return `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  }





  fetchAndDisplayNearbyLocations(lat: number, lng: number, amenityType: string): Promise<void> {
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
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

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
    return match ? { lat: parseFloat(match[1]), lng: parseFloat(match[2]) } : null;
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
      .bindPopup('House Location')
      .openPopup();
  }




  fetchAndDisplayNearbyPlaces(lat: number, lng: number, amenityType: string): void {
    const query = `
      [out:json][timeout:25];
      node(around:1000, ${lat}, ${lng})["amenity"="${amenityType}"];
      out center 10;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

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

  onAmenityClick(amenityType: string): void {
    if (this.selectedAmenity === amenityType) {
      console.log(`Amenity ${amenityType} is already displayed.`);
      return; // Avoid fetching if the same amenity is already selected
    }

    this.selectedAmenity = amenityType;
    this.isLoadingAmenity = true;

    const coordinates = this.extractCoordinates(this.house?.linkMap || '');
    if (coordinates) {
      this.fetchAndDisplayNearbyLocations(coordinates.lat, coordinates.lng, amenityType)
        .finally(() => {
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

  fetchHouseDetails(): void {
    this.houseService.getHouseById(this.houseId.toString()).subscribe({
      next: (response) => {
        this.house = response.result;
        if (this.house) {
          // Load images for the house
          this.loadCardImages(this.house);

          // Fetch location details
          this.fetchLocationDetails(
            this.house.province,
            this.house.district,
            this.house.commune,
            this.house.village
          );

          // Handle map link
          if (this.house.linkMap && this.isValidGoogleMapsLink(this.house.linkMap)) {
            // Sanitize and prepare the URL for embedding
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
              `${this.house.linkMap}&output=embed`
            );
            console.log('Google Maps link validated and set:', this.house.linkMap);
          } else {
            console.warn('Invalid or missing linkMap, using fallback URL.');
            this.house.linkMap = this.generateDefaultGoogleMapsLink(11.5564, 104.9282);
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
              `${this.house.linkMap}&output=embed`
            );
          }
        }

        // Ensure the UI updates
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(`Error fetching house details for ID ${this.houseId}:`, error);
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

    console.log(`Attempting to toggle favorite for house ID: ${this.houseId}`);

    this.houseService.toggleFavorite(this.houseId, 'house').subscribe({
      next: () => {
        // Toggle the 'favoriteable' status locally without blocking future clicks
        if (this.house) {
          this.house.favoriteable = !this.house.favoriteable;
        }
        console.log(
          `Successfully toggled favorite for house ID ${this.houseId}`
        );
        this.getHouseDetails(this.houseId); // Re-fetch details to confirm state
      },
      error: (error) => {
        console.warn(
          `Toggling favorite encountered an error. Assuming success. Error:`,
          error
        );
        // Toggle locally regardless of error, for smooth UI
        if (this.house) {
          this.house.favoriteable = !this.house.favoriteable;
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

  loadImages(house: House): void {
    if (house.imagePaths && house.imagePaths.length > 0) {
      house.safeImagePaths = []; // Clear existing paths

      // Track the loading order to set the first image consistently
      let imagesLoaded = 0;

      house.imagePaths.forEach((imagePath, index) => {
        this.houseService.getImage(imagePath).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            house.safeImagePaths!.push(safeUrl);

            imagesLoaded++;

            // Set `currentImage` and `currentImageIndex` to the first loaded image
            if (imagesLoaded === 1) {
              this.currentImage = safeUrl;
              house.currentImageIndex = 0; // Assign 0 since images are available
            }
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
    } else {
      // Handle cases with no images
      house.safeImagePaths = [];
      this.currentImage = null;
      house.currentImageIndex = -1; // Use -1 or any number indicating no images
    }
  }

  prevImage(event: MouseEvent): void {
    event.stopPropagation();
    if (this.house?.safeImagePaths && this.house.safeImagePaths.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.house.safeImagePaths.length) % this.house.safeImagePaths.length;
      this.currentImage = this.house.safeImagePaths[this.currentImageIndex];
    }
  }

  // Go to next image
  nextImage(event: MouseEvent): void {
    event.stopPropagation();
    if (this.house?.safeImagePaths && this.house.safeImagePaths.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.house.safeImagePaths.length;
      this.currentImage = this.house.safeImagePaths[this.currentImageIndex];
    }
  }

  // Function to load images specifically for card houses in Related Posts
  loadCardImages(house: House): void {
    house.safeImagePaths = []; // Clear any existing images
    house.imagePaths.forEach((imagePath) => {
      this.houseService.getImage(imagePath).subscribe(
        (imageBlob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          house.safeImagePaths!.push(safeUrl);
        },
        (error) => {
          console.error('Error loading image:', error);
        }
      );
    });
    house.currentImageIndex = 0; // Set default image index
  }

  // Function to go to the previous image for a specific card house
  prevCardImage(house: House): void {
    if (house.safeImagePaths && house.safeImagePaths.length > 1) {
      house.currentImageIndex =
        house.currentImageIndex > 0
          ? house.currentImageIndex - 1
          : house.safeImagePaths.length - 1;
    }
  }

  // Function to go to the next image for a specific card house
  nextCardImage(house: House): void {
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
  selectImage(image: SafeUrl): void {
    this.currentImage = image;
  }

  goBack(): void {
    window.history.back();
  }

  loadSafeImagePaths(house: House): SafeUrl[] {
    return house.imagePaths.map((path) =>
      this.sanitizer.bypassSecurityTrustUrl(path)
    );
  }

  loadRelatedHouses(page: number = 0): void {
    this.loading = true;
    this.houseService.getHouses({ page, size: this.itemsPerPage }).subscribe(
      (response) => {
        const responseData = response.result;
        this.houses = responseData.result;
        this.totalPages = responseData.totalPage;

        // Call loadImage for each house to load its images
        this.houses.forEach((house) => {
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

  loadImage(house: any): void {
    if (house.imagePaths && house.imagePaths.length > 0) {
      house.safeImagePaths = [];
      house.imagePaths.forEach((imageUrl: string) => {
        this.houseService.getImage(imageUrl).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            house.safeImagePaths.push(safeUrl);
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
      house.currentImageIndex = 0;
    } else {
      house.safeImagePaths = [];
      house.currentImageIndex = 0;
    }
  }

  prevImage1(house: House): void {
    // Check if safeImagePaths exists and has images
    if (house.safeImagePaths && house.safeImagePaths.length > 1) {
      house.currentImageIndex =
        house.currentImageIndex > 0
          ? house.currentImageIndex - 1
          : house.safeImagePaths.length - 1;
    }
  }

  nextImage1(house: House): void {
    // Check if safeImagePaths exists and has images
    if (house.safeImagePaths && house.safeImagePaths.length > 1) {
      house.currentImageIndex =
        house.currentImageIndex < house.safeImagePaths.length - 1
          ? house.currentImageIndex + 1
          : 0;
    }
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

    // Provide the `postType` argument, such as 'house' or another applicable value.
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

  toggleFavorite1(houseId: number): void {
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

  updateHouseData(houseId: number): void {
    this.houseService.getHouseById(houseId.toString()).subscribe({
      next: (response) => {
        const updatedHouse = response.result;
        const index = this.houses.findIndex((h) => h.id === houseId);
        if (index !== -1) {
          this.houses[index] = {
            ...this.houses[index],
            likeCount: updatedHouse.likeCount,
            likeable: updatedHouse.likeable,
            favoriteable: updatedHouse.favoriteable,
            pending: false,
          };
        }
      },
      error: (error) => {
        console.error(`Error updating data for house ID ${houseId}:`, error);
      },
    });
  }
  navigateToContact(): void {
    this.router.navigate(['/contact']); // Replace '/contact' with your desired route
  }

  goToDetails(houseId: number): void {
    this.router.navigate(['/details', houseId]);
  }
  goToDetails1(houseId: number): void {
    this.router.navigate(['/details', houseId]).then(() => {
      window.location.reload();
      // this.fetchHouseDetails();
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
}
