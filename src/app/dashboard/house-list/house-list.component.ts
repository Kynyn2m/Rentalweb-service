import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HouseService } from 'src/app/Service/house.service';
import { HouseUpdateDialogComponent } from '../house-update-dialog/house-update-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';

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
  imagePath: string;
  safeImagePath?: SafeUrl; // Safe image URL after sanitization
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
    this.houseService.getHouses().subscribe(response => {
      if (response.code === 200) {
        this.houses = response.result.result as House[];
        this.houses.forEach(house => this.loadImage(house)); // Load and sanitize images
      }
    }, error => {
      console.error('Error fetching house data', error);
    });
  }

  loadImage(house: House): void {
    this.houseService.getImage(house.imagePath).subscribe(
      (imageBlob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        house.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
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
        imagePath: house.imagePath // Ensure the correct imagePath is passed
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchHouses();
      }
    });
  }




}
