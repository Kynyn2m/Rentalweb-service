import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LandService } from 'src/app/add-post/add-post-land/land.service';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { LandFormComponent } from './land-form/land-form.component';

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
    this.landService.getLand().subscribe(
      (response) => {
        if (response.code === 200) {
          this.land = response.result.result as Land[];
          this.land.forEach((land) => this.loadImage(land)); // Load and sanitize images
        }
      },
      (error) => {
        console.error('Error fetching land data', error);
      }
    );
  }

  loadImage(land: Land): void {
    this.landService.getImage(land.imagePath).subscribe(
      (imageBlob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        land.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
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
        title: 'Delete Land',
        message: `Are you sure you want to delete the land: ${land.title}?`,
        confirmText: 'Yes, Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.deleteLand(land);
      }
    });
  }
  deleteLand(land: Land): void {
    this.landService.deleteLand(land.id).subscribe(
      (response) => {
        this.snackBar.open(`${land.title} has been deleted.`, 'Close', {
          duration: 3000,
        });
        this.fetchLand(); // Refresh the list after deletion
      },
      (error) => {
        console.error('Error deleting land:', error);
        this.snackBar.open(`Failed to delete ${land.title}.`, 'Close', {
          duration: 3000,
        });
      }
    );
  }

  openUpdateDialog(land: Land): void {
    const dialogRef = this.dialog.open(LandFormComponent, {
      width: '600px',
      data: {
        ...land,
        imagePath: land.imagePath, // Ensure the correct imagePath is passed
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchLand();
      }
    });
  }
}
