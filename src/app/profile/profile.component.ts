import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service'; // Adjust path to your service
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // To handle image sanitization
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UpdateHouseDialogComponent } from './update-house-dialog/update-house-dialog.component';
import { UpdateLandDialogComponent } from './update-land-dialog/update-land-dialog.component';
import { UpdateRoomDialogComponent } from './update-room-dialog/update-room-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: any = {
    id: '',
    fullName: '',
    gender: '',
    email: '',
    username: '',
    avatarUrl: '',
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

  constructor(
    private profileService: ProfileService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchProfile();
    this.fetchUserHouses();
    this.fetchUserLands();
    this.fetchUserRooms();
  }

  // Fetch profile details and load the user's avatar
  fetchProfile(): void {
    this.profileService.getProfile().subscribe(
      (response) => {
        if (response.code === 200) {
          this.user = response.result;
          this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(
            this.user.avatarUrl
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

  // Handle file selection and create a preview
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create a preview URL using FileReader for the newly selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(
          reader.result as string
        );
      };
      reader.readAsDataURL(file);
    }
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

  // Save profile updates including file upload
  saveProfile(): void {
    const formData = new FormData();
    formData.append('fullName', this.user.fullName);
    formData.append('gender', this.user.gender);
    formData.append('email', this.user.email);
    formData.append('username', this.user.username);
    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile); // Ensure key matches backend expectation
    }

    this.profileService.updateProfile(formData).subscribe(
      (response) => {
        console.log('Profile updated successfully', response);
        this.snackBar.open('Profile updated successfully', 'Close', {
          duration: 3000,
        });
        this.fetchProfile(); // Refresh the profile after update
      },
      (error) => {
        console.error('Error updating profile:', error);
        this.error = 'Error updating profile';
      }
    );
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
  //Lands
  fetchUserLand(): void {
    this.profileService.getUserLands().subscribe((response) => {
      if (response.code === 200) {
        this.lands = response.result.result;
        this.lands.forEach((land) => this.loadImage(land, 'land'));
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

  updateLand(landId: number, landData: any, selectedFile: File | null): void {
    const formData = new FormData();
    formData.append('title', landData.title);
    formData.append('description', landData.description);
    formData.append('price', landData.price);
    formData.append('landSize', landData.landSize);
    formData.append('phoneNumber', landData.phoneNumber);
    formData.append('linkMap', landData.linkMap);
    formData.append('floor', landData.floor);
    formData.append('width', landData.width);
    formData.append('height', landData.height);
    formData.append('provinceId', landData.provinceId);
    formData.append('districtId', landData.districtId);
    formData.append('communeId', landData.communeId);
    formData.append('villageId', landData.villageId);

    // Append the image file if a new image is selected
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    // Use ProfileService to send the update request
    this.profileService.updateLand(landId, formData).subscribe(
      (response) => {
        console.log('land updated successfully:', response);
        this.snackBar.open('land updated successfully', 'Close', {
          duration: 3000,
        });
        this.fetchUserLands(); // Refresh the house list after update
      },
      (error) => {
        console.error('Error updating land:', error);
        this.snackBar.open('Error updating land', 'Close', { duration: 3000 });
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
