import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service'; // Adjust path to your service
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // To handle image sanitization
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UpdateHouseDialogComponent } from './update-house-dialog/update-house-dialog.component';
import { UpdateLandDialogComponent } from './update-land-dialog/update-land-dialog.component';
import { UpdateRoomDialogComponent } from './update-room-dialog/update-room-dialog.component';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { HouseService } from '../Service/house.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

import Swal from 'sweetalert2';
import { RoomService } from '../Service/room.service';
import { LandService } from '../add-post/add-post-land/land.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  mainTabIndex = 0;

  favorites = {
    houses: [] as any[],
    lands: [] as any[],
    rooms: [] as any[],
  };
  user: any = {
    id: '',
    fullName: '',
    gender: '',
    email: '',
    username: '',
    avatarUrl: '',
    profileUrl: '',
    address: '',
  };
  selectedFile: File | null = null;
  loading: boolean = true;
  error: string | null = null;
  imagePreview: SafeUrl | null = null;
  houses: any[] = []; // Store the list of user's houses
  lands: any[] = []; // Store the list of user's lands
  rooms: any[] = [];

  provinces: any[] = [];
  districts: any[] = [];
  communes: any[] = [];
  villages: any[] = [];

  private startX: number = 0;
  private startY: number = 0;

  constructor(
    private profileService: ProfileService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private http: HttpClient,
    private houseService: HouseService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private cdr: ChangeDetectorRef,
    private roomService: RoomService,
    private landService: LandService
  ) {}

  ngOnInit(): void {
    this.fetchProfile();
    this.fetchUserHouses();
    this.fetchUserLands();
    this.fetchUserRooms();
    this.fetchFavorites();
  }

  // Fetch profile details and load the user's avatar
  fetchProfile(): void {
    this.profileService.getProfile().subscribe(
      (response) => {
        if (response.code === 200) {
          this.user = response.result;
          this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(
            this.user.profileUrl
          ); // Set the avatar
        } else {
          this.error = 'Failed to fetch profile data';
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching profile data:', error);
        this.error = 'Error fetching profile data';
        this.loading = false;
      }
    );
  }
  fetchFavorites(): void {
    this.http.get<any>(`${environment.apiUrl}/public/favorites`).subscribe(
      (response) => {
        if (response.code === 200 && response.result) {
          // Populate favorite items based on response structure
          this.favorites.houses = response.result.houses || [];
          this.favorites.lands = response.result.lands || [];
          this.favorites.rooms = response.result.rooms || [];

          // Process images for each favorite item just like in "My Properties"
          this.favorites.houses.forEach((house) =>
            this.loadImage(house, 'house')
          );
          this.favorites.lands.forEach((land) => this.loadImage(land, 'land'));
          this.favorites.rooms.forEach((room) => this.loadImage(room, 'room'));
        } else {
          this.snackBar.open('Failed to load favorites', 'Close', {
            duration: 3000,
          });
        }
      },
      (error) => {
        console.error('Error fetching favorites:', error);
        this.snackBar.open('Failed to load favorites', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  // Handle file selection and create a preview
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string; // Set preview for immediate display
      };
      reader.readAsDataURL(file); // Trigger file reading and load preview
    }
  }


  saveProfile(): void {
    const formData = new FormData();
    formData.append('fullName', this.user.fullName);
    formData.append('gender', this.user.gender);
    formData.append('email', this.user.email);
    formData.append('phoneNumber', this.user.phoneNumber);
    formData.append('username', this.user.username);

    // Append the image if a file is selected
    if (this.selectedFile) {
        formData.append('image', this.selectedFile); // Ensure key is 'image'
    } else {
        console.warn('No file selected for upload.'); // Debugging: to check file selection
    }

    // Call the profile service to update profile data
    this.profileService.updateProfile(formData).subscribe(
        (response) => {
            console.log('Profile updated successfully', response);
            this.snackBar.open('Profile updated successfully', 'Close', {
                duration: 3000,
            });
            // Reload the page after saving the profile
            window.location.reload();
        },
        (error) => {
            console.error('Error updating profile:', error);
            this.error = 'Error updating profile';
        }
    );
}



  deleteLand(landId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Delete Land',
        message: 'Are you sure you want to delete this land?',
        confirmText: 'Yes',
        cancelText: 'No',
      },
    });

    // Check the result after the dialog closes
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // If confirmed, proceed with deletion
        this.profileService.deleteLand(landId).subscribe(() => {
          // After successful deletion, update the UI by removing the deleted land
          this.lands = this.lands.filter((land) => land.id !== landId);
        });
      }
    });
  }
  deleteRoom(roomId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Delete Room',
        message: 'Are you sure you want to delete this room?',
        confirmText: 'Yes',
        cancelText: 'No',
      },
    });

    // Check the result after the dialog closes
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // If confirmed, proceed with deletion
        this.profileService.deleteRoom(roomId).subscribe(() => {
          // After successful deletion, update the UI by removing the deleted room
          this.rooms = this.rooms.filter((room) => room.id !== roomId);
        });
      }
    });
  }
  deleteHouse(houseId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: {
        title: 'Delete House',
        message: 'Are you sure you want to delete this house?',
        confirmText: 'Yes',
        cancelText: 'No',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // If confirmed, proceed to delete the house
        this.profileService.deleteHouse(houseId).subscribe(() => {
          this.houses = this.houses.filter((house) => house.id !== houseId);
        });
      }
    });
  }



  // Fallback in case the avatar image fails to load
  onImageError(event: any): void {
    event.target.src = '/assets/img/user.png'; // Fallback image path
  }

  // Cancel the profile update and reset changes
  cancelEdit(): void {
    this.fetchProfile(); // Reload the original profile data
    this.selectedFile = null; // Clear the selected file
  }

  // Fetch user's houses
  fetchUserHouses(): void {
    this.profileService.getUserHouses().subscribe((response) => {
      if (response.code === 200) {
        this.houses = response.result.result;
        this.houses.forEach((house) => this.loadImage(house, 'house'));
      }
    });
  }

  // Fetch user's lands
  fetchUserLands(): void {
    this.profileService.getUserLands().subscribe((response) => {
      if (response.code === 200) {
        this.lands = response.result.result;
        this.lands.forEach((land) => this.loadImage(land, 'land'));
      }
    });
  }

  // Fetch user's rooms
  fetchUserRooms(): void {
    this.profileService.getUserRooms().subscribe((response) => {
      if (response.code === 200) {
        this.rooms = response.result.result;
        this.rooms.forEach((room) => this.loadImage(room, 'room'));
      }
    });
  }
  loadImage(item: any, type: string): void {
    item.safeImagePaths = []; // Initialize an array for the sanitized image URLs
    item.currentImageIndex = 0; // Start by showing the first image

    // Loop through the array of imagePaths and sanitize each one
    if (item.imagePaths && item.imagePaths.length > 0) {
      item.imagePaths.forEach((imagePath: string) => {
        this.profileService.getImage(imagePath).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            item.safeImagePaths.push(safeUrl); // Push sanitized URLs to the array
          },
          (error) => {
            console.error(
              `Error loading ${type} image for item with ID: ${
                item.id || 'unknown'
              }`,
              error
            );
            item.safeImagePaths.push('/assets/img/default-placeholder.png'); // Add a placeholder if image loading fails
          }
        );
      });
    } else {
      item.safeImagePaths.push('/assets/img/default-placeholder.png'); // Add a single placeholder if no image exists
    }
  }
  goToDetails(houseId: number): void {
    this.houseService.viewHouse(houseId).subscribe(() => {
      this.router.navigate(['/details', houseId]);
    });
  }

  goToDetailsRoom(roomId: number): void {
    this.roomService.viewRoom(roomId).subscribe(() => {
      this.router.navigate(['/details-room', roomId]);
    });
  }
  goToDetailsLand(landId: number): void {
    this.landService.viewLand(landId).subscribe(() => {
      this.router.navigate(['/details-land', landId]);
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

  unfavoriteHouse(houseId: number): void {
    // Show confirmation dialog using SweetAlert
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this house from your favorites?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, unfavorite it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with unfavoriting if confirmed
        this.houseService.favoriteHouse(houseId, 'house').subscribe({
          next: (response) => {
            console.log(
              `Successfully unfavorited house ID ${houseId}:`,
              response
            );
            this.fetchFavorites();
            this.snackBar.open(
              'House successfully removed from favorites.',
              'Close',
              {
                duration: 3000,
              }
            );
          },
          error: (error) => {
            if (error.status === 200) {
              console.log(`Handled as success despite error block:`, error);
              this.fetchFavorites();
              this.snackBar.open(
                'House successfully removed from favorites.',
                'Close',
                {
                  duration: 3000,
                }
              );
            } else {
              console.error(`Error unfavoriting house ID ${houseId}:`, error);
              this.snackBar.open(
                'Failed to remove house from favorites.',
                'Close',
                {
                  duration: 3000,
                }
              );
            }
          },
        });
      }
    });
  }
  unfavoriteRoom(roomId: number): void {
    // Show confirmation dialog using SweetAlert
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this house from your favorites?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, unfavorite it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with unfavoriting if confirmed
        this.roomService.favoriteRoom(roomId, 'room').subscribe({
          next: (response) => {
            console.log(
              `Successfully unfavorited room ID ${roomId}:`,
              response
            );
            this.fetchFavorites();
            this.snackBar.open(
              'Room successfully removed from favorites.',
              'Close',
              {
                duration: 3000,
              }
            );
          },
          error: (error) => {
            if (error.status === 200) {
              console.log(`Handled as success despite error block:`, error);
              this.fetchFavorites();
              this.snackBar.open(
                'Room successfully removed from favorites.',
                'Close',
                {
                  duration: 3000,
                }
              );
            } else {
              console.error(`Error unfavoriting room ID ${roomId}:`, error);
              this.snackBar.open(
                'Failed to remove room from favorites.',
                'Close',
                {
                  duration: 3000,
                }
              );
            }
          },
        });
      }
    });
  }

  unfavoriteLand(landId: number): void {
    // Show confirmation dialog using SweetAlert
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this land from your favorites?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, unfavorite it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with unfavoriting if confirmed
        this.landService.favoriteLand(landId, 'land').subscribe({
          next: (response) => {
            console.log(
              `Successfully unfavorited land ID ${landId}:`,
              response
            );
            this.fetchFavorites();
            this.snackBar.open(
              'Land successfully removed from favorites.',
              'Close',
              {
                duration: 3000,
              }
            );
          },
          error: (error) => {
            if (error.status === 200) {
              console.log(`Handled as success despite error block:`, error);
              this.fetchFavorites();
              this.snackBar.open(
                'Land successfully removed from favorites.',
                'Close',
                {
                  duration: 3000,
                }
              );
            } else {
              console.error(`Error unfavoriting room ID ${landId}:`, error);
              this.snackBar.open(
                'Failed to remove land from favorites.',
                'Close',
                {
                  duration: 3000,
                }
              );
            }
          },
        });
      }
    });
  }
  startClick(event: MouseEvent): void {
    // Record the initial mouse position on mousedown
    this.startX = event.clientX;
    this.startY = event.clientY;
  }

  endClick(event: MouseEvent, houseId: number): void {
    // Calculate the distance the mouse moved
    const distanceX = Math.abs(event.clientX - this.startX);
    const distanceY = Math.abs(event.clientY - this.startY);

    // Set a threshold distance to distinguish a click from text selection
    const threshold = 5;
    if (distanceX < threshold && distanceY < threshold) {
      // Navigate to details only if it’s a genuine click (not a selection)
      this.goToDetails(houseId);
    }
  }

  // Navigate to the previous image in the carousel
  prevImage(item: any): void {
    if (item.currentImageIndex > 0) {
      item.currentImageIndex--;
    } else {
      item.currentImageIndex = item.safeImagePaths.length - 1; // Loop back to the last image
    }
  }

  // Navigate to the next image in the carousel
  nextImage(item: any): void {
    if (item.currentImageIndex < item.safeImagePaths.length - 1) {
      item.currentImageIndex++;
    } else {
      item.currentImageIndex = 0; // Loop back to the first image
    }
  }
  updateHouse(
    houseId: number,
    houseData: any,
    selectedFile: File | null
  ): void {
    const formData = new FormData();
    formData.append('title', houseData.title);
    formData.append('description', houseData.description);
    formData.append('price', houseData.price);
    formData.append('landSize', houseData.landSize);
    formData.append('phoneNumber', houseData.phoneNumber);
    formData.append('linkMap', houseData.linkMap);
    formData.append('floor', houseData.floor);
    formData.append('width', houseData.width);
    formData.append('height', houseData.height);
    formData.append('provinceId', houseData.provinceId);
    formData.append('districtId', houseData.districtId);
    formData.append('communeId', houseData.communeId);
    formData.append('villageId', houseData.villageId);

    // Append the image file if a new image is selected
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    // Use ProfileService to send the update request
    this.profileService.updateHouse(houseId, formData).subscribe(
      (response) => {
        console.log('House updated successfully:', response);
        this.snackBar.open('House updated successfully', 'Close', {
          duration: 3000,
        });
        this.fetchUserHouses(); // Refresh the house list after update
      },
      (error) => {
        console.error('Error updating house:', error);
        this.snackBar.open('Error updating house', 'Close', { duration: 3000 });
      }
    );
  }

  openUpdateDialog(house: any): void {
    const dialogRef = this.dialog.open(UpdateHouseDialogComponent, {
      width: '800px',
      data: { houseData: house },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.success) {
        this.fetchUserHouses();
      }
    });
  }

  openUpdateLand(land: any): void {
    const dialogRef = this.dialog.open(UpdateLandDialogComponent, {
      width: '800px',
      data: { landData: land },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.success) {
        this.fetchUserLands();
      }
    });
  }
  openUpdateRoom(room: any): void {
    const dialogRef = this.dialog.open(UpdateRoomDialogComponent, {
      width: '800px',
      data: { roomData: room },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.success) {
        this.fetchUserLands();
      }
    });
  }
}
