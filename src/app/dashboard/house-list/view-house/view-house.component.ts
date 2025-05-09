import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { VillageService } from 'src/app/address/village.service';
import { HouseService } from 'src/app/Service/house.service';

export interface House {
  id: number;
  title: string;
  description: string;
  price: number;
  width: number;
  height: number;
  floor: number;
  imagePaths: string[];
  phoneNumber: string;
  safeImagePath?: SafeUrl;  // Will store the sanitized image URL
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
  selector: 'app-view-house',
  templateUrl: './view-house.component.html',
  styleUrls: ['./view-house.component.css']
})
export class ViewHouseComponent implements OnInit {

  currentImageIndex: number = 0;
  currentImage: string = '';
  currentUserAvatar: string = '';

  provinces: any[] = [];
  districts: any[] = [];
  communes: any[] = [];
  villages: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ViewHouseComponent>,
    @Inject(MAT_DIALOG_DATA) public houseData: House,
    private cdr: ChangeDetectorRef,
    private districtService: DistrictService,
    private communeService: CommuneService,
    private villageService: VillageService,
    private houseService: HouseService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    // Load provinces
    this.loadProvinces();

    // Load house images if any
    if (this.houseData.imagePaths && this.houseData.imagePaths.length > 0) {
      this.loadImage(this.houseData);
    }

    // Load user avatar if available (using the correct field: image)
    if (this.houseData.user.image) {
      this.loadUserAvatar(this.houseData.user);
    }
  }

  // Load the first house image and sanitize it using image blob
  loadImage(house: House): void {
    if (!house.imagePaths || house.imagePaths.length === 0) {
      console.error('No image paths available for house:', house);
      return;
    }

    const firstImagePath = house.imagePaths[0]; // Use the first image path

    this.houseService.getImage(firstImagePath).subscribe(
      (imageBlob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        house.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        this.currentImage = objectURL;
      },
      (error) => {
        console.error('Error loading house image:', error);
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

    this.houseService.getImage(imagePath).subscribe(
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
    if (this.houseData.imagePaths && this.houseData.imagePaths.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.houseData.imagePaths.length) % this.houseData.imagePaths.length;
      this.updateCurrentImage();
    }
  }

  // Show the next image
  showNextImage(): void {
    if (this.houseData.imagePaths && this.houseData.imagePaths.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.houseData.imagePaths.length;
      this.updateCurrentImage();
    }
  }

  // Update the current image to the new image based on index
  updateCurrentImage(): void {
    const imagePath = this.houseData.imagePaths[this.currentImageIndex];
    this.houseService.getImage(imagePath).subscribe(
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

        if (this.houseData.province) {
          this.onProvinceSelected(this.houseData.province);
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

        if (this.houseData.district) {
          this.onDistrictSelected(this.houseData.district);
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

        if (this.houseData.commune) {
          this.onCommuneSelected(this.houseData.commune);
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
    const province = this.provinces.find(p => p.id === provinceId);
    return province ? province.khmerName || province.englishName : 'Unknown Province';
  }

  getDistrictName(districtId: number): string {
    const district = this.districts.find(d => d.id === districtId);
    return district ? district.khmerName || district.englishName : 'Unknown District';
  }

  getCommuneName(communeId: number): string {
    const commune = this.communes.find(c => c.id === communeId);
    return commune ? commune.khmerName || commune.englishName : 'Unknown Commune';
  }

  getVillageName(villageId: number): string {
    const village = this.villages.find(v => v.id === villageId);
    return village ? village.khmerName || village.englishName : 'Unknown Village';
  }

  // Close dialog
  closeDialog(): void {
    this.dialogRef.close();
  }
}
