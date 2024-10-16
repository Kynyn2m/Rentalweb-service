import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HouseService } from 'src/app/Service/house.service';
import { HouseUpdateDialogComponent } from '../house-update-dialog/house-update-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { PaggingModel } from 'src/app/_helpers/response-model';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';

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
  safeImagePath?: SafeUrl;
  likeCount: number;
  linkMap: string;
  viewCount: number;
  createdAt: string;
}

@Component({
  selector: 'app-house-list',
  templateUrl: './house-list.component.html',
  styleUrls: ['./house-list.component.css']
})
export class HouseListComponent implements OnInit {
  displayedColumns: string[] = ['image', 'title', 'location', 'price', 'width', 'height', 'floor', 'likeCount', 'viewCount', 'createdAt','actions'];
  houses: House[] = [];
  loading: boolean = true;
  pagingModel?: PaggingModel;
  size = environment.pageSize;
  pageSizeOptions: number[] = environment.pageSizeOptions;
  currentPage = 0;
  page = environment.currentPage;

  constructor(
    private houseService: HouseService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.fetchHouses();
  }

  fetchHouses(): void {
    this.loading = true; // Start loading
    this.houseService.getHouses().subscribe(
      response => {
        if (response.code === 200) {
          this.houses = response.result.result as House[];
          this.houses.forEach(house => this.loadImage(house));
        }
        this.loading = false; // Stop loading after fetch
      },
      error => {
        console.error('Error fetching house data', error);
        this.loading = false; // Stop loading on error
      }
    );
  }
  pageChanged(event: PageEvent): void {
    this.size = event.pageSize;
    this.currentPage = event.pageIndex;
    this.fetchHouses();
  }
  loadImage(house: House): void {
    if (!house.imagePaths || house.imagePaths.length === 0) {
      console.error('No image paths available for house:', house);
      return;
    }

    const firstImagePath = house.imagePaths[0]; // Use the first image for display

    this.houseService.getImage(firstImagePath).subscribe(
      (imageBlob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        house.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        console.log('Image loaded:', house.safeImagePath);
      },
      (error) => {
        console.error('Error loading image:', error);
      }
    );
  }



  openDeleteDialog(house: House): void {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete House',
        message: `Are you sure you want to delete the house: ${house.title}?`,
        confirmText: 'Yes, Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteHouse(house);
      }
    });
  }

  // Handle house deletion
  deleteHouse(house: House): void {
    this.houseService.deleteHouse(house.id).subscribe(
      (response) => {
        this.snackBar.open(`${house.title} has been deleted.`, 'Close', { duration: 3000 });
        this.fetchHouses(); // Refresh the list after deletion
      },
      (error) => {
        console.error('Error deleting house:', error);
        this.snackBar.open(`Failed to delete ${house.title}.`, 'Close', { duration: 3000 });
      }
    );
  }
  openUpdateDialog(house: House): void {
    const dialogRef = this.dialog.open(HouseUpdateDialogComponent, {
      width: '600px',
      data: {
        ...house,
        imagePath: house.imagePaths // Ensure the correct imagePath is passed
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchHouses();
      }
    });
  }




}
