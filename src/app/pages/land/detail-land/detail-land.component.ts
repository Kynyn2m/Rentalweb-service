import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LandService } from 'src/app/add-post/add-post-land/land.service';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { VillageService } from 'src/app/address/village.service';
import { ImageDialogComponent } from 'src/app/details/image-dialog.component';
interface Land {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  landSize: number;
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
}
@Component({
  selector: 'app-detail-land',
  templateUrl: './detail-land.component.html',
  styleUrls: ['./detail-land.component.css'],
})
export class DetailLandComponent {
  land: Land | null = null;
  selectedImage: SafeUrl | null = null;
  provinceName: string = '';
  districtName: string = '';
  communeName: string = '';
  villageName: string = '';
  constructor(
    private sanitizer: DomSanitizer,
    private landService: LandService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private districtService: DistrictService,
    private communeService: CommuneService,
    private villageService: VillageService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const landId = this.route.snapshot.paramMap.get('id');
    if (landId) {
      this.getLandDetails(landId);
    }
  }

  getLandDetails(id: string): void {
    this.landService.getLandById(id).subscribe(
      (response) => {
        this.land = response.result as Land;
        if (this.land) {
          this.loadImages(this.land);
          this.fetchLocationDetails(
            this.land.province,
            this.land.district,
            this.land.commune,
            this.land.village
          );
        }
      },
      (error) => {
        console.error('Error fetching land details:', error);
      }
    );
  }

  fetchLocationDetails(
    provinceId: number,
    districtId: number,
    communeId: number,
    villageId: number
  ): void {
    // Fetch province name
    this.districtService.getProvincesPublic().subscribe((res) => {
      const province = res.result.find((p: any) => p.id === provinceId);
      this.provinceName = province
        ? province.khmerName || province.englishName
        : 'Unknown Province';

      // Manually trigger change detection after setting the value
      this.cdr.detectChanges();
    });

    // Fetch district name
    this.districtService.getByProvincePublic(provinceId).subscribe((res) => {
      const district = res.result.find((d: any) => d.id === districtId);
      this.districtName = district
        ? district.khmerName || district.englishName
        : 'Unknown District';

      // Manually trigger change detection after setting the value
      this.cdr.detectChanges();
    });

    // Fetch commune name
    this.communeService.getByDistrictPublic(districtId).subscribe((res) => {
      const commune = res.result.find((c: any) => c.id === communeId);
      this.communeName = commune
        ? commune.khmerName || commune.englishName
        : 'Unknown Commune';

      // Manually trigger change detection after setting the value
      this.cdr.detectChanges();
    });

    // Fetch village name
    this.villageService.getByCommunePublic(communeId).subscribe((res) => {
      const village = res.result.find((v: any) => v.id === villageId);
      this.villageName = village
        ? village.khmerName || village.englishName
        : 'Unknown Village';

      // Manually trigger change detection after setting the value
      this.cdr.detectChanges();
    });
  }

  loadImages(land: Land): void {
    if (land.imagePaths && land.imagePaths.length > 0) {
      land.safeImagePaths = [];
      land.imagePaths.forEach((imagePath) => {
        this.landService.getImage(imagePath).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            land.safeImagePaths!.push(safeUrl);
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
    }
  }

  // Open the image in the full-screen dialog
  openImageInFullScreen(image: SafeUrl): void {
    this.dialog.open(ImageDialogComponent, {
      data: { image },
      panelClass: 'full-screen-modal',
    });
  }

  likeLand(landId: number): void {
    if (!this.land) return;

    this.landService.likeLand(landId).subscribe(() => {
      this.land!.likeCount += 1;
    });
  }

  goBack(): void {
    window.history.back();
  }
}
