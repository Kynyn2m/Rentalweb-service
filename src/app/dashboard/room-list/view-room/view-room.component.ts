import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { VillageService } from 'src/app/address/village.service';
import { RoomService } from 'src/app/Service/room.service';
export interface Room {
  id: number;
  title: string;
  description: string;
  price: number;
  width: number;
  height: number;
  floor: number;
  imagePaths: string[];
  phoneNumber: string;
  safeImagePath?: SafeUrl; // Will store the sanitized image URL
  linkMap: string;
  createdAt: string;
  likeCount: number;
  viewCount: number;
  province: number;
  district: number;
  commune: number;
  village: number;
  type: string;
  likeable: boolean;
  favoriteable: boolean;
  user: {
    id: number;
    fullName: string;
    email: string;
    username: string;
    gender: string;
    image: string; // Note: image is used for the user avatar
    safeImagePath?: SafeUrl; // Will store the sanitized avatar URL
  };
}
@Component({
  selector: 'app-view-room',
  templateUrl: './view-room.component.html',
  styleUrls: ['./view-room.component.css'],
})
export class ViewRoomComponent {
  currentImageIndex: number = 0;
  currentImage: string = '';
  currentUserAvatar: string = '';

  provinces: any[] = [];
  districts: any[] = [];
  communes: any[] = [];
  villages: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ViewRoomComponent>,
    @Inject(MAT_DIALOG_DATA) public roomData: Room,
    private cdr: ChangeDetectorRef,
    private districtService: DistrictService,
    private communeService: CommuneService,
    private villageService: VillageService,
    private roomService: RoomService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Load provinces
    this.loadProvinces();

    // Load room images if any
    if (this.roomData.imagePaths && this.roomData.imagePaths.length > 0) {
      this.loadImage(this.roomData);
    }

    // Load user avatar if available (using the correct field: image)
    if (this.roomData.user.image) {
      this.loadUserAvatar(this.roomData.user);
    }
  }

  // Load the first room image and sanitize it using image blob
  loadImage(room: Room): void {
    if (!room.imagePaths || room.imagePaths.length === 0) {
      console.error('No image paths available for room:', room);
      return;
    }

    const firstImagePath = room.imagePaths[0]; // Use the first image path

    this.roomService.getImage(firstImagePath).subscribe(
      (imageBlob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        room.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        this.currentImage = objectURL;
      },
      (error) => {
        console.error('Error loading room image:', error);
      }
    );
  }

  // Load user avatar image and sanitize it
  loadUserAvatar(user: any): void {
    if (!user.image) {
      console.error('No image available for user:', user);
      return;
    }

    const imagePath = user.image; // Use the avatar image URL

    this.roomService.getImage(imagePath).subscribe(
      (imageBlob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        user.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        this.currentUserAvatar = objectURL; // Optional, for direct use
      },
      (error) => {
        console.error('Error loading user avatar:', error);
      }
    );
  }

  // Show the previous image
  showPreviousImage(): void {
    if (this.roomData.imagePaths && this.roomData.imagePaths.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.roomData.imagePaths.length) %
        this.roomData.imagePaths.length;
      this.updateCurrentImage();
    }
  }

  // Show the next image
  showNextImage(): void {
    if (this.roomData.imagePaths && this.roomData.imagePaths.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.roomData.imagePaths.length;
      this.updateCurrentImage();
    }
  }

  // Update the current image to the new image based on index
  updateCurrentImage(): void {
    const imagePath = this.roomData.imagePaths[this.currentImageIndex];
    this.roomService.getImage(imagePath).subscribe(
      (imageBlob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        this.currentImage = objectURL;
      },
      (error) => {
        console.error('Error loading next/previous image:', error);
      }
    );
  }

  // Fetch provinces data from the API
  loadProvinces() {
    this.districtService.getProvincesPublic().subscribe(
      (res) => {
        this.provinces = res.result.result || [];
        this.cdr.detectChanges();

        if (this.roomData.province) {
          this.onProvinceSelected(this.roomData.province);
        }
      },
      (error) => {
        console.error('Error fetching provinces:', error);
      }
    );
  }

  // Handling selection of province
  onProvinceSelected(provinceId: number) {
    this.districtService.getByProvincePublic(provinceId).subscribe(
      (res) => {
        this.districts = res.result || [];
        this.communes = [];
        this.villages = [];
        this.cdr.detectChanges();

        if (this.roomData.district) {
          this.onDistrictSelected(this.roomData.district);
        }
      },
      (error) => {
        console.error('Error fetching districts:', error);
      }
    );
  }

  onDistrictSelected(districtId: number) {
    this.communeService.getByDistrictPublic(districtId).subscribe(
      (res) => {
        this.communes = res.result || [];
        this.villages = [];
        this.cdr.detectChanges();

        if (this.roomData.commune) {
          this.onCommuneSelected(this.roomData.commune);
        }
      },
      (error) => {
        console.error('Error fetching communes:', error);
      }
    );
  }

  onCommuneSelected(communeId: number) {
    this.villageService.getByCommunePublic(communeId).subscribe(
      (res) => {
        this.villages = res.result || [];
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching villages:', error);
      }
    );
  }

  // Utility methods for getting names based on IDs
  getProvinceName(provinceId: number): string {
    const province = this.provinces.find((p) => p.id === provinceId);
    return province
      ? province.khmerName || province.englishName
      : 'Unknown Province';
  }

  getDistrictName(districtId: number): string {
    const district = this.districts.find((d) => d.id === districtId);
    return district
      ? district.khmerName || district.englishName
      : 'Unknown District';
  }

  getCommuneName(communeId: number): string {
    const commune = this.communes.find((c) => c.id === communeId);
    return commune
      ? commune.khmerName || commune.englishName
      : 'Unknown Commune';
  }

  getVillageName(villageId: number): string {
    const village = this.villages.find((v) => v.id === villageId);
    return village
      ? village.khmerName || village.englishName
      : 'Unknown Village';
  }

  // Close dialog
  closeDialog(): void {
    this.dialogRef.close();
  }
}
