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
import { RoomService } from 'src/app/Service/room.service';
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

interface Room {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  roomsSize: number;
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
  selector: 'app-detail-room',
  templateUrl: './detail-room.component.html',
  styleUrls: ['./detail-room.component.css'],
})
export class DetailRoomComponent
  implements OnInit, AfterViewInit, AmenityCounts
{
  rooms: Room | null = null;
  roomId!: number;
  room: any[] = [];
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
    private roomService: RoomService,
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
    this.roomId = +this.route.snapshot.paramMap.get('id')!;
    this.fetchRoomDetails();
    this.loadRelatedRooms();
    // Extract or use default coordinates to fetch nearby locations on page load
    this.roomId = +this.route.snapshot.paramMap.get('id')!;
    const roomIdParam = this.route.snapshot.paramMap.get('id');
    const roomId = roomIdParam ? parseInt(roomIdParam, 10) : null;

    if (roomId) {
      this.getRoomDetails(roomId); // Fetch room details and link map
      this.loadComments(roomId); // Load comments for the room

      // Fetch and display nearby locations when coordinates are available
      if (this.rooms?.linkMap) {
        const coordinates = this.extractCoordinates(this.rooms.linkMap);
        if (coordinates) {
          this.fetchAndDisplayNearbyLocations(coordinates.lat, coordinates.lng);
        }
      } else {
        // Use default coordinates if no specific linkMap is available
        this.fetchAndDisplayNearbyLocations(11.5564, 104.9282);
      }
    } else {
      console.error('Invalid room ID');
    }
  }

  loadComments(roomId: number): void {
    this.roomService.getComments(roomId).subscribe(
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

    const roomId = this.rooms?.id ?? 34;
    const type = 'room';
    const description = this.newCommentText;

    this.roomService.postComment(roomId, description, type).subscribe(
      (response) => {
        if (response) {
          this.loadComments(roomId); // Reload comments to fetch latest data
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

    this.roomService.replyToComment(commentId, description).subscribe(
      (response) => {
        if (response) {
          const roomId = this.rooms?.id ?? 34;
          this.loadComments(roomId); // Reload comments to fetch latest data
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
      roomId: this.rooms?.id ?? null, // Replace with actual roomId if necessary
      type: 'rooms', // or 'rooms'/'room' as per requirement
    };

    this.roomService.updateComment(updateData.id, updateData).subscribe(
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

    this.roomService.deleteComment(commentId).subscribe(
      () => {
        const roomId = this.rooms?.id ?? 34;
        this.loadComments(roomId); // Reload comments to update the list
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
    if (this.rooms && this.rooms.linkMap) {
      const coordinates = this.extractCoordinates(this.rooms.linkMap);
      if (coordinates) {
        this.initializeMap(coordinates.lat, coordinates.lng);
      }
    }
  }

  getRoomDetails(id: number): void {
    this.roomService.getRoomById(id.toString()).subscribe(
      (response) => {
        this.rooms = response.result as Room;
        if (this.rooms) {
          this.loadImages(this.rooms); // Load images if required
          this.fetchLocationDetails(
            this.rooms.province,
            this.rooms.district,
            this.rooms.commune,
            this.rooms.village
          );

          if (this.rooms.linkMap) {
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
              `${this.rooms.linkMap}&output=embed`
            );
          }
          console.log('Fetched updated room details:', this.rooms);
        }
        this.cdr.detectChanges(); // Ensure the view updates after fetching
      },
      (error) => {
        console.error('Error fetching room details:', error);
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
        const mapContainer = document.getElementById('room-map');
        if (!mapContainer) {
          console.error('Map container not found.');
          return;
        }

        // Initialize the map centered on the property
        this.map = L.map('room-map').setView([lat, lng], 14);
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

  fetchRoomDetails(): void {
    this.roomService.getRoomById(this.roomId.toString()).subscribe({
      next: (response) => {
        this.rooms = response.result;
        if (this.rooms) {
          this.loadCardImages(this.rooms);
          this.fetchLocationDetails(
            this.rooms.province,
            this.rooms.district,
            this.rooms.commune,
            this.rooms.village
          );
          if (this.rooms.linkMap) {
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
              `${this.rooms.linkMap}&output=embed`
            );
          }
          console.log('Fetched updated room details:', this.rooms);
        }
        this.cdr.detectChanges(); // Ensure the view updates after fetching
      },
      error: (error) => {
        console.error(
          `Error fetching room details for ID ${this.roomId}:`,
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

    console.log(`Attempting to toggle favorite for room ID: ${this.roomId}`);

    this.roomService.toggleFavorite(this.roomId, 'room').subscribe({
      next: () => {
        // Toggle the 'favoriteable' status locally without blocking future clicks
        if (this.rooms) {
          this.rooms.favoriteable = !this.rooms.favoriteable;
        }
        console.log(`Successfully toggled favorite for room ID ${this.roomId}`);
        this.getRoomDetails(this.roomId); // Re-fetch details to confirm state
      },
      error: (error) => {
        console.warn(
          `Toggling favorite encountered an error. Assuming success. Error:`,
          error
        );
        // Toggle locally regardless of error, for smooth UI
        if (this.rooms) {
          this.rooms.favoriteable = !this.rooms.favoriteable;
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

  loadImages(rooms: Room): void {
    if (rooms.imagePaths && rooms.imagePaths.length > 0) {
      rooms.safeImagePaths = []; // Clear existing paths

      // Track the loading order to set the first image consistently
      let imagesLoaded = 0;

      rooms.imagePaths.forEach((imagePath, index) => {
        this.roomService.getImage(imagePath).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            rooms.safeImagePaths!.push(safeUrl);

            imagesLoaded++;

            // Set `currentImage` and `currentImageIndex` to the first loaded image
            if (imagesLoaded === 1) {
              this.currentImage = safeUrl;
              rooms.currentImageIndex = 0; // Assign 0 since images are available
            }
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
    } else {
      // Handle cases with no images
      rooms.safeImagePaths = [];
      this.currentImage = null;
      rooms.currentImageIndex = -1; // Use -1 or any number indicating no images
    }
  }

  // Function to load images specifically for card rooms in Related Posts
  loadCardImages(rooms: Room): void {
    rooms.safeImagePaths = []; // Clear any existing images
    rooms.imagePaths.forEach((imagePath) => {
      this.roomService.getImage(imagePath).subscribe(
        (imageBlob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          rooms.safeImagePaths!.push(safeUrl);
        },
        (error) => {
          console.error('Error loading image:', error);
        }
      );
    });
    rooms.currentImageIndex = 0; // Set default image index
  }

  // Function to go to the previous image for a specific card room
  prevCardImage(room: Room): void {
    if (room.safeImagePaths && room.safeImagePaths.length > 1) {
      room.currentImageIndex =
        room.currentImageIndex > 0
          ? room.currentImageIndex - 1
          : room.safeImagePaths.length - 1;
    }
  }

  // Function to go to the next image for a specific card room
  nextCardImage(room: Room): void {
    if (room.safeImagePaths && room.safeImagePaths.length > 1) {
      room.currentImageIndex =
        room.currentImageIndex < room.safeImagePaths.length - 1
          ? room.currentImageIndex + 1
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
    if (this.rooms && this.rooms.safeImagePaths) {
      const index = this.rooms.safeImagePaths.indexOf(this.currentImage!);
      if (index > 0) {
        this.currentImage = this.rooms.safeImagePaths[index - 1];
      }
    }
  }

  nextImage(): void {
    if (this.rooms && this.rooms.safeImagePaths) {
      const index = this.rooms.safeImagePaths.indexOf(this.currentImage!);
      if (index < this.rooms.safeImagePaths.length - 1) {
        this.currentImage = this.rooms.safeImagePaths[index + 1];
      }
    }
  }
  selectImage(image: SafeUrl): void {
    this.currentImage = image;
  }

  goBack(): void {
    window.history.back();
  }

  loadSafeImagePaths(room: Room): SafeUrl[] {
    return room.imagePaths.map((path) =>
      this.sanitizer.bypassSecurityTrustUrl(path)
    );
  }

  loadRelatedRooms(page: number = 0): void {
    this.loading = true;
    this.roomService.getRooms({ page, size: this.itemsPerPage }).subscribe(
      (response) => {
        const responseData = response.result;
        this.room = responseData.result;
        this.totalPages = responseData.totalPage;

        // Call loadImage for each room to load its images
        this.room.forEach((room) => {
          this.loadImage(room);
        });

        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('Error loading rooms:', error);
      }
    );
  }

  loadImage(rooms: any): void {
    if (rooms.imagePaths && rooms.imagePaths.length > 0) {
      rooms.safeImagePaths = [];
      rooms.imagePaths.forEach((imageUrl: string) => {
        this.roomService.getImage(imageUrl).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            rooms.safeImagePaths.push(safeUrl);
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
      rooms.currentImageIndex = 0;
    } else {
      rooms.safeImagePaths = [];
      rooms.currentImageIndex = 0;
    }
  }

  prevImage1(room: Room): void {
    // Check if safeImagePaths exists and has images
    if (room.safeImagePaths && room.safeImagePaths.length > 1) {
      room.currentImageIndex =
        room.currentImageIndex > 0
          ? room.currentImageIndex - 1
          : room.safeImagePaths.length - 1;
    }
  }

  nextImage1(room: Room): void {
    // Check if safeImagePaths exists and has images
    if (room.safeImagePaths && room.safeImagePaths.length > 1) {
      room.currentImageIndex =
        room.currentImageIndex < room.safeImagePaths.length - 1
          ? room.currentImageIndex + 1
          : 0;
    }
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

    // Provide the `postType` argument, such as 'room' or another applicable value.
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

  toggleFavorite1(roomId: number): void {
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

  updateRoomData(roomId: number): void {
    this.roomService.getRoomById(roomId.toString()).subscribe({
      next: (response) => {
        const updatedRoom = response.result;
        const index = this.room.findIndex((h) => h.id === roomId);
        if (index !== -1) {
          this.room[index] = {
            ...this.room[index],
            likeCount: updatedRoom.likeCount,
            likeable: updatedRoom.likeable,
            favoriteable: updatedRoom.favoriteable,
            pending: false,
          };
        }
      },
      error: (error) => {
        console.error(`Error updating data for room ID ${roomId}:`, error);
      },
    });
  }

  goToDetailsRoom(roomId: number): void {
    this.router.navigate(['/details-room', roomId]);
  }

  goToDetailsRoom1(roomId: number): void {
    this.router.navigate(['/details-room', roomId]).then(() => {
      window.location.reload();
      // this.fetchHouseDetails();
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
}
