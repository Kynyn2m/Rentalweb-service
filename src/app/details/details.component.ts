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

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private houseService: HouseService,
    private dialog: MatDialog,
    private districtService: DistrictService,
    private communeService: CommuneService,
    private villageService: VillageService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
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
          this.fetchLocationDetails(this.house.province, this.house.district, this.house.commune, this.house.village);
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
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
    }
  }

  fetchLocationDetails(provinceId: number, districtId: number, communeId: number, villageId: number): void {
    // Fetch province name
    this.districtService.getProvincesPublic().subscribe((res) => {
      const province = res.result.find((p: any) => p.id === provinceId);
      this.provinceName = province ? province.khmerName || province.englishName : 'Unknown Province';

      // Manually trigger change detection after setting the value
      this.cdr.detectChanges();
    });

    // Fetch district name
    this.districtService.getByProvincePublic(provinceId).subscribe((res) => {
      const district = res.result.find((d: any) => d.id === districtId);
      this.districtName = district ? district.khmerName || district.englishName : 'Unknown District';

      // Manually trigger change detection after setting the value
      this.cdr.detectChanges();
    });

    // Fetch commune name
    this.communeService.getByDistrictPublic(districtId).subscribe((res) => {
      const commune = res.result.find((c: any) => c.id === communeId);
      this.communeName = commune ? commune.khmerName || commune.englishName : 'Unknown Commune';

      // Manually trigger change detection after setting the value
      this.cdr.detectChanges();
    });

    // Fetch village name
    this.villageService.getByCommunePublic(communeId).subscribe((res) => {
      const village = res.result.find((v: any) => v.id === villageId);
      this.villageName = village ? village.khmerName || village.englishName : 'Unknown Village';

      // Manually trigger change detection after setting the value
      this.cdr.detectChanges();
    });
  }

  openImageInFullScreen(image: SafeUrl): void {
    this.dialog.open(ImageDialogComponent, {
      data: { image },
      panelClass: 'full-screen-modal',
    });
  }

  likeHouse(houseId: number): void {
    if (!this.house) return;

    this.houseService.likeHouse(houseId).subscribe(() => {
      this.house!.likeCount += 1;
    });
  }

  goBack(): void {
    window.history.back();
  }
}
