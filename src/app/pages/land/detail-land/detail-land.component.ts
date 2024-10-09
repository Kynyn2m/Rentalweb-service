import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LandService } from 'src/app/add-post/add-post-land/land.service';
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
}
@Component({
  selector: 'app-detail-land',
  templateUrl: './detail-land.component.html',
  styleUrls: ['./detail-land.component.css'],
})
export class DetailLandComponent {
  land: Land | null = null;
  selectedImage: SafeUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private landService: LandService,
    private dialog: MatDialog
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
        }
      },
      (error) => {
        console.error('Error fetching land details:', error);
      }
    );
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
