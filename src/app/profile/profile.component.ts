import { Component, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';  // Adjust path to your service
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // To handle image sanitization
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {
    id: '',
    fullName: '',
    gender: '',
    email: '',
    username: '',
    avatarUrl: '',
    address: ''
  };
  selectedFile: File | null = null;
  loading: boolean = true;
  error: string | null = null;
  imagePreview: SafeUrl | null = null;
  houses: any[] = [];  // Store the list of user's houses
  lands: any[] = [];   // Store the list of user's lands
  rooms: any[] = [];

  constructor(
    private profileService: ProfileService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
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
          this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(this.user.avatarUrl); // Set the avatar
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
        this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    event.target.src = '/assets/img/user.png';  // Fallback image path
  }

  // Cancel the profile update and reset changes
  cancelEdit(): void {
    this.fetchProfile();  // Reload the original profile data
    this.selectedFile = null;  // Clear the selected file
  }

  // Fetch user's houses
  fetchUserHouses(): void {
    this.profileService.getUserHouses().subscribe(response => {
      if (response.code === 200) {
        this.houses = response.result.result;
        this.houses.forEach(house => this.loadImage(house, 'house'));
      }
    });
  }

  // Fetch user's lands
  fetchUserLands(): void {
    this.profileService.getUserLands().subscribe(response => {
      if (response.code === 200) {
        this.lands = response.result.result;
        this.lands.forEach(land => this.loadImage(land, 'land'));
      }
    });
  }

  // Fetch user's rooms
  fetchUserRooms(): void {
    this.profileService.getUserRooms().subscribe(response => {
      if (response.code === 200) {
        this.rooms = response.result.result;
        this.rooms.forEach(room => this.loadImage(room, 'room'));
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
            item.safeImagePaths.push(safeUrl);  // Push sanitized URLs to the array
          },
          (error) => {
            console.error(`Error loading ${type} image for item with ID: ${item.id || 'unknown'}`, error);
            item.safeImagePaths.push('/assets/img/default-placeholder.png');  // Add a placeholder if image loading fails
          }
        );
      });
    } else {
      item.safeImagePaths.push('/assets/img/default-placeholder.png');  // Add a single placeholder if no image exists
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



}
