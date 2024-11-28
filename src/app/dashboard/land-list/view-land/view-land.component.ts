import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LandService } from 'src/app/add-post/add-post-land/land.service';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { VillageService } from 'src/app/address/village.service';
interface Land {
  id: number;
  title: string;
  description: string;
  price: number;
  landSize: number;
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
  selector: 'app-view-land',
  templateUrl: './view-land.component.html',
  styleUrls: ['./view-land.component.css'],
})
export class ViewLandComponent {
  currentImageIndex: number = 0;
  currentImage: string = '';
  currentUserAvatar: string = '';

  provinces: any[] = [];
  districts: any[] = [];
  communes: any[] = [];
  villages: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ViewLandComponent>,
    @Inject(MAT_DIALOG_DATA) public landData: Land,
    private cdr: ChangeDetectorRef,
    private districtService: DistrictService,
    private communeService: CommuneService,
    private villageService: VillageService,
    private landService: LandService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Load provinces
    this.loadProvinces();

    // Load land images if any
    if (this.landData.imagePaths && this.landData.imagePaths.length > 0) {
      this.loadImage(this.landData);
    }

    // Load user avatar if available (using the correct field: image)
    if (this.landData.user.image) {
      this.loadUserAvatar(this.landData.user);
    }
  }

  // Load the first land image and sanitize it using image blob
  loadImage(land: Land): void {
    if (!land.imagePaths || land.imagePaths.length === 0) {
      console.error('No image paths available for land:', land);
      return;
    }

    const firstImagePath = land.imagePaths[0]; // Use the first image path

    this.landService.getImage(firstImagePath).subscribe(
      (imageBlob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        land.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        this.currentImage = objectURL;
      },
      (error) => {
        console.error('Error loading land image:', error);
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

    this.landService.getImage(imagePath).subscribe(
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
    if (this.landData.imagePaths && this.landData.imagePaths.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.landData.imagePaths.length) %
        this.landData.imagePaths.length;
      this.updateCurrentImage();
    }
  }

  // Show the next image
  showNextImage(): void {
    if (this.landData.imagePaths && this.landData.imagePaths.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.landData.imagePaths.length;
      this.updateCurrentImage();
    }
  }

  // Update the current image to the new image based on index
  updateCurrentImage(): void {
    const imagePath = this.landData.imagePaths[this.currentImageIndex];
    this.landService.getImage(imagePath).subscribe(
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

        if (this.landData.province) {
          this.onProvinceSelected(this.landData.province);
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

        if (this.landData.district) {
          this.onDistrictSelected(this.landData.district);
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

        if (this.landData.commune) {
          this.onCommuneSelected(this.landData.commune);
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
