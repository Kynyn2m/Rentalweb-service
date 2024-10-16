import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HouseService } from '../Service/house.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from './image-dialog.component';
import { DistrictService } from '../address/district.service';
import { CommuneService } from '../address/commune.service';
import { VillageService } from '../address/village.service';

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
}

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit {
  house: House | null = null;
  selectedImage: SafeUrl | null = null;
  provinceName: string = '';
  districtName: string = '';
  communeName: string = '';
  villageName: string = '';
  currentImage: SafeUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private houseService: HouseService,
    private dialog: MatDialog,
    private districtService: DistrictService,
    private communeService: CommuneService,
    private villageService: VillageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const houseId = this.route.snapshot.paramMap.get('id');
    if (houseId) {
      this.getHouseDetails(houseId);
    }
  }

  getHouseDetails(id: string): void {
    this.houseService.getHouseById(id).subscribe(
      (response) => {
        this.house = response.result as House;
        if (this.house) {
          this.loadImages(this.house);
          this.fetchLocationDetails(
            this.house.province,
            this.house.district,
            this.house.commune,
            this.house.village
          );
        }
      },
      (error) => {
        console.error('Error fetching house details:', error);
      }
    );
  }

  loadImages(house: House): void {
    if (house.imagePaths && house.imagePaths.length > 0) {
      house.safeImagePaths = [];
      house.imagePaths.forEach((imagePath) => {
        this.houseService.getImage(imagePath).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            house.safeImagePaths!.push(safeUrl);
            if (!this.currentImage) {
              this.currentImage = safeUrl; // Set the first image as the current image
            }
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
    }
  }

  selectImage(image: SafeUrl): void {
    this.currentImage = image;
  }

  previousImage(): void {
    if (this.house && this.house.safeImagePaths) {
      const index = this.house.safeImagePaths.indexOf(this.currentImage!);
      if (index > 0) {
        this.currentImage = this.house.safeImagePaths[index - 1];
      }
    }
  }

  nextImage(): void {
    if (this.house && this.house.safeImagePaths) {
      const index = this.house.safeImagePaths.indexOf(this.currentImage!);
      if (index < this.house.safeImagePaths.length - 1) {
        this.currentImage = this.house.safeImagePaths[index + 1];
      }
    }
  }

  openImageInFullScreen(image: SafeUrl): void {
    this.dialog.open(ImageDialogComponent, {
      data: { image },
      panelClass: 'full-screen-modal',
    });
  }

  fetchLocationDetails(
    provinceId: number,
    districtId: number,
    communeId: number,
    villageId: number
  ): void {
    // Fetch location details logic
    // ...
  }

  likeHouse(houseId: number): void {
    if (!this.house || this.house.pending) return;

    this.house.pending = true;

    if (this.house.liked) {
      this.house.likeCount -= 1;
      this.house.liked = false;
      this.house.pending = false;
    } else {
      this.houseService.likeHouse(houseId).subscribe(
        () => {
          this.house!.likeCount += 1;
          this.house!.liked = true;
          this.house!.pending = false;
        },
        () => {
          this.house!.pending = false;
        }
      );
    }
  }

  goBack(): void {
    window.history.back();
  }
}
