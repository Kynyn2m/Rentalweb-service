import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LandService } from 'src/app/add-post/add-post-land/land.service';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { LandFormComponent } from './land-form/land-form.component';
import { PaggingModel } from 'src/app/_helpers/response-model';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';

interface Land {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  landSize: number;
  phoneNumber: string;
  imagePath: string;
  safeImagePath?: SafeUrl; // Safe image URL after sanitization
  likeCount: number;
  linkMap: string;
  viewCount: number;
  createdAt: string;
  imagePaths: string[];
}
@Component({
  selector: 'app-land-list',
  templateUrl: './land-list.component.html',
  styleUrls: ['./land-list.component.css'],
})
export class LandListComponent {
  displayedColumns: string[] = [
    'image',
    'title',
    'location',
    'price',
    'landSize',
    'likeCount',
    'viewCount',
    'createdAt',
    'actions',
  ];
  land: Land[] = [];
  loading: boolean = true;
  pagingModel?: PaggingModel;
  size = environment.pageSize;
  pageSizeOptions: number[] = environment.pageSizeOptions;
  currentPage = 0;
  page = environment.currentPage;

  constructor(
    private landService: LandService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchLand();
  }

  fetchLand(): void {
    this.loading = true; // Start loading
    this.landService.getLand().subscribe(
      response => {
        if (response.code === 200) {
          this.land = response.result.result as Land[];
          this.land.forEach(land => this.loadImage(land));
        }
        this.loading = false; // Stop loading after fetch
      },
      error => {
        console.error('Error fetching land data', error);
        this.loading = false; // Stop loading on error
      }
    );
  }
  pageChanged(event: PageEvent): void {
    this.size = event.pageSize;
    this.currentPage = event.pageIndex;
    this.fetchLand();
  }
  loadImage(land: Land): void {
    if (!land.imagePaths || land.imagePaths.length === 0) {
      console.error('No image paths available for land:', land);
      return;
    }

    const firstImagePath = land.imagePaths[0]; // Use the first image for display

    this.landService.getImage(firstImagePath).subscribe(
      (imageBlob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        land.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        console.log('Image loaded:', land.safeImagePath);
      },
      (error) => {
        console.error('Error loading image:', error);
      }
    );
  }



  openDeleteDialog(land: Land): void {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete land',
        message: `Are you sure you want to delete the land: ${land.title}?`,
        confirmText: 'Yes, Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteland(land);
      }
    });
  }

  // Handle land deletion
  deleteland(land: Land): void {
    this.landService.deleteLand(land.id).subscribe(
      (response) => {
        this.snackBar.open(`${land.title} has been deleted.`, 'Close', { duration: 3000 });
        this.fetchLand(); // Refresh the list after deletion
      },
      (error) => {
        console.error('Error deleting land:', error);
        this.snackBar.open(`Failed to delete ${land.title}.`, 'Close', { duration: 3000 });
      }
    );
  }
  openUpdateDialog(land: Land): void {
    const dialogRef = this.dialog.open(LandFormComponent, {
      width: '600px',
      data: {
        ...land,
        imagePath: land.imagePaths // Ensure the correct imagePath is passed
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchLand();
      }
    });
  }
}
