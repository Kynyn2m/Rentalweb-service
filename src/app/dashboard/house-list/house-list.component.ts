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

import * as XLSX from 'xlsx';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';


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
  styleUrls: ['./house-list.component.css'],
})
export class HouseListComponent implements OnInit {
  displayedColumns: string[] = [
    'image',
    'title',
    'location',
    'price',
    'width',
    'height',
    'floor',
    'likeCount',
    'viewCount',
    'createdAt',
    'actions',
  ];
  houses: House[] = [];
  loading: boolean = true;
  pagingModel?: PaggingModel;
  size = environment.pageSize;
  pageSizeOptions: number[] = environment.pageSizeOptions;
  currentPage = 0;
  searchTerm: string = ''; // Added search term

  constructor(
    private houseService: HouseService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchHouses();
  }

  fetchHouses(): void {
    this.loading = true;

    const params = {
      page: this.currentPage,
      size: this.size,
      search: this.searchTerm, // Include search term in params
    };

    this.houseService.getHouses(params).subscribe(
      (response) => {
        console.log('API Response:', response);
        if (response.code === 200) {
          this.houses = response.result.result as House[];
          this.houses.forEach((house) => this.loadImage(house));
          this.pagingModel = response.result.pagingModel;
          console.log('Total Elements:', this.pagingModel?.totalElements);
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching house data', error);
        this.loading = false;
      }
    );
  }

  exportToExcel(): void {
    this.loading = true;

    const params = {
      page: this.currentPage,
      size: this.size,
      search: this.searchTerm,
    };

    this.houseService.getHouses(params).subscribe(
      (response) => {
        if (response.code === 200 && response.result?.result) {
          const houses = response.result.result;

          if (!houses || houses.length === 0) {
            this.snackBar.open('No data available to export.', 'Close', { duration: 3000 });
            this.loading = false;
            return;
          }

          // Flatten data
          const flatData = houses.map((house: any) => ({
            ID: house.id,
            Title: house.title,
            Description: house.description,
            Price: house.price,
            Width: house.width,
            Height: house.height,
            Floor: house.floor,
            Phone: house.phoneNumber,
            ImageURLs: house.imagePaths.join(', '),
            MapLink: house.linkMap,
            Likes: house.likeCount,
            Views: house.viewCount,
            CreatedAt: house.createdAt,
          }));

          console.log('Flat Data for Excel:', flatData);

          // Create worksheet
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(flatData);
          console.log('Worksheet:', ws);

          // Create workbook
          const wb: XLSX.WorkBook = { Sheets: { data: ws }, SheetNames: ['Houses'] };

          // Write workbook to Excel buffer
          const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          console.log('Excel Buffer:', excelBuffer);

          // Trigger download
          const fileName = 'house_data.xlsx';
          const data: Blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(data);
          link.download = fileName;
          link.click();
        } else {
          console.error('Error fetching house data for export:', response.message);
          this.snackBar.open('Failed to fetch data for export.', 'Close', { duration: 3000 });
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching house data for export:', error);
        this.loading = false;
        this.snackBar.open('Failed to fetch data for export.', 'Close', { duration: 3000 });
      }
    );
  }






  onSearch(): void {
    this.currentPage = 0; // Reset to the first page on a new search
    this.fetchHouses();
  }
  clearSearch(): void {
    this.searchTerm = ''; // Clear the search term
    this.currentPage = 0; // Reset to the first page
    this.fetchHouses(); // Fetch all data without filters
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

    const firstImagePath = house.imagePaths[0];

    this.houseService.getImage(firstImagePath).subscribe(
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
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.deleteHouse(house);
      }
    });
  }

  deleteHouse(house: House): void {
    this.houseService.deleteHouse(house.id).subscribe(
      (response) => {
        this.snackBar.open(`${house.title} has been deleted.`, 'Close', {
          duration: 3000,
        });
        this.fetchHouses();
      },
      (error) => {
        console.error('Error deleting house:', error);
        this.snackBar.open(`Failed to delete ${house.title}.`, 'Close', {
          duration: 3000,
        });
      }
    );
  }

  openUpdateDialog(house: House): void {
    const dialogRef = this.dialog.open(HouseUpdateDialogComponent, {
      width: '600px',
      data: {
        ...house,
        imagePath: house.imagePaths,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchHouses();
      }
    });
  }
}
