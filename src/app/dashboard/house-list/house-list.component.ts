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
import { MatTableDataSource } from '@angular/material/table';
import { ViewHouseComponent } from './view-house/view-house.component';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  export interface House {
    id: number;
    title: string;
    description: string;
    price: number;
    width: number;
    height: number;
    floor: number;
    imagePaths: string[];
    phoneNumber: string;
    safeImagePath?: SafeUrl;  // Will store the sanitized image URL
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
      imagePaths: string[]; // assuming user has image paths for avatar
      safeImagePath?: SafeUrl; // Will store the sanitized avatar URL
    };
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
    // 'location',
    // 'price',
    // 'width',
    // 'height',
    // 'floor',
    'likeCount',
    'viewCount',
    'createdAt',
    'status',
    'actions',
  ];
  // houses: House[] = [];
  dataSource = new MatTableDataSource<House>([]);
  loading: boolean = true;
  pagingModel?: PaggingModel;
  size = environment.pageSize;
  pageSizeOptions: number[] = environment.pageSizeOptions;
  currentPage = 0;
  searchTerm: string = ''; // Added search term
  page = environment.currentPage;

  startDate: string | null = null; // For the start date
  endDate: string | null = null;   // For the end date




  constructor(
    private houseService: HouseService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchHouses();
  }

  fetchHouses(search?: string): void {
    this.loading = true;

    const params = {
      page: this.currentPage,
      size: this.size,
      search: search || '', // Include the search term if provided
    };

    this.houseService.getHouses(params).subscribe(
      (response) => {
        if (response.code === 200) {
          let houses = response.result.result as House[];

          // Apply date filters if provided
          if (this.startDate && this.startDate !== '') {
            const start = new Date(this.startDate); // This is safe now because we ensured it's not null
            houses = houses.filter((house) => {
              const createdAt = new Date(house.createdAt);
              return createdAt >= start;
            });
          }

          if (this.endDate && this.endDate !== '') {
            const end = new Date(this.endDate); // This is safe now because we ensured it's not null
            houses = houses.filter((house) => {
              const createdAt = new Date(house.createdAt);
              return createdAt <= end;
            });
          }

          // Set the filtered houses to the data source
          this.dataSource.data = houses;
          this.pagingModel = response.result; // Capture pagination data
          this.dataSource.data.forEach((house) => this.loadImage(house));
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching house data', error);
        this.loading = false;
      }
    );
  }

  // Get the status based on the creation date of the house
  getStatus(createdAt: string): { text: string, className: string } {
    const today = new Date();
    const houseDate = new Date(createdAt);

    // Calculate the difference in milliseconds
    const timeDiff = today.getTime() - houseDate.getTime();

    // Convert the difference to days
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    if (dayDiff === 0) {
      return { text: 'New', className: 'status-new' }; // Added today
    } else if (dayDiff === 1) {
      return { text: '1 day ago', className: 'status-recent' }; // Added yesterday
    } else if (dayDiff === 2) {
      return { text: '2 days ago', className: 'status-recent' }; // Added 2 days ago
    } else if (dayDiff === 3) {
      return { text: '3 days ago', className: 'status-recent' }; // Added 3 days ago
    } else if (dayDiff < 7) {
      return { text: `${dayDiff} days ago`, className: 'status-recent' }; // Added within the last week
    } else if (dayDiff < 30) {
      return { text: `${Math.floor(dayDiff / 7)} weeks ago`, className: 'status-week-old' }; // Added within the last month
    } else if (dayDiff < 365) {
      return { text: `${Math.floor(dayDiff / 30)} months ago`, className: 'status-month-old' }; // Added within the last year
    } else {
      return { text: `${Math.floor(dayDiff / 365)} years ago`, className: 'status-old' }; // Added more than a year ago
    }
  }


  viewHouseData(house: House): void {
    const dialogRef = this.dialog.open(ViewHouseComponent, {
      width: '800px',
      data: house,  // Pass house data to the dialog component
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle any actions after the dialog is closed (if needed)
        console.log('Dialog closed:', result);
      }
    });
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
            this.snackBar.open('No data available to export.', 'Close', {
              duration: 3000,
            });
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
          const wb: XLSX.WorkBook = {
            Sheets: { data: ws },
            SheetNames: ['Houses'],
          };

          // Write workbook to Excel buffer
          const excelBuffer: any = XLSX.write(wb, {
            bookType: 'xlsx',
            type: 'array',
          });
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
          console.error(
            'Error fetching house data for export:',
            response.message
          );
          this.snackBar.open('Failed to fetch data for export.', 'Close', {
            duration: 3000,
          });
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching house data for export:', error);
        this.loading = false;
        this.snackBar.open('Failed to fetch data for export.', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  onSearch(): void {
    this.currentPage = 0; // Reset to the first page on a new search
    this.fetchHouses(this.searchTerm); // Pass searchTerm to fetchHouses
  }


  clearSearch(): void {
    this.searchTerm = ''; // Clear the search term
    this.startDate = null; // Clear start date
    this.endDate = null; // Clear end date
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

}
