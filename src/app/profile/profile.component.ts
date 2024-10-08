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

  constructor(private profileService: ProfileService, private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,

  ) {}

  ngOnInit(): void {
    this.fetchProfile();
    this.fetchUserHouses();
    this.fetchUserLands();
    this.fetchUserRooms();
  }

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

  saveProfile(): void {
    const formData = new FormData();
    formData.append('fullName', this.user.fullName);
    formData.append('gender', this.user.gender);
    formData.append('email', this.user.email);
    formData.append('username', this.user.username);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.profileService.updateProfile(formData).subscribe(
      (response) => {
        console.log('Profile updated successfully', response);
        this.snackBar.open('Profile updated successfully', 'Close', {
          duration: 3000,
        });
        this.fetchProfile();
      },
      (error) => {
        console.error('Error updating profile:', error);
        this.error = 'Error updating profile';
      }
    );
  }
  onImageError(event: any): void {
    event.target.src = '/assets/img/user.png';
  }

  cancelEdit(): void {
    console.log('Cancelling profile edit');
    this.fetchProfile();
  }
  fetchUserHouses(): void {
    this.profileService.getUserHouses().subscribe(response => {
      if (response.code === 200) {
        this.houses = response.result.result;
        this.houses.forEach(house => this.loadImage(house, 'house'));
      }
    });
  }

  fetchUserLands(): void {
    this.profileService.getUserLands().subscribe(response => {
      if (response.code === 200) {
        this.lands = response.result.result;
        this.lands.forEach(land => this.loadImage(land, 'land'));
      }
    });
  }

  fetchUserRooms(): void {
    this.profileService.getUserRooms().subscribe(response => {
      if (response.code === 200) {
        this.rooms = response.result.result;
        this.rooms.forEach(room => this.loadImage(room, 'room'));
      }
    });
  }

  // Load image and sanitize the URL
  loadImage(item: any, type: string): void {
    this.profileService.getImage(item.imagePath).subscribe(
      (imageBlob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        item.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      (error) => {
        console.error(`Error loading ${type} image:`, error);
      }
    );
  }
}
