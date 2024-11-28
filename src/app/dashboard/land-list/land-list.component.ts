import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LandService } from 'src/app/add-post/add-post-land/land.service';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { LandFormComponent } from './land-form/land-form.component';
import { PaggingModel } from 'src/app/_helpers/response-model';
import { environment } from 'src/environments/environment';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ViewLandComponent } from './view-land/view-land.component';

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
  // land: Land[] = [];
  dataSource = new MatTableDataSource<Land>([]);
  loading: boolean = true;
  pagingModel?: PaggingModel;
  size = environment.pageSize;
  pageSizeOptions: number[] = environment.pageSizeOptions;
  currentPage = 0;
  page = environment.currentPage;
  searchTerm: string = '';
  startDate: string | null = null; // For the start date
  endDate: string | null = null; // For the end date
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private landService: LandService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchLand();
  }

  fetchLand(search?: string): void {
    this.loading = true;

    const params = {
      page: this.currentPage,
      size: this.size,
      search: search || '', // Include the search term if provided
    };

    this.landService.getLand(params).subscribe(
      (response) => {
        if (response.code === 200) {
          let land = response.result.result as Land[];

          // Apply date filters if provided
          if (this.startDate && this.startDate !== '') {
            const start = new Date(this.startDate); // This is safe now because we ensured it's not null
            land = land.filter((room) => {
              const createdAt = new Date(room.createdAt);
              return createdAt >= start;
            });
          }

          if (this.endDate && this.endDate !== '') {
            const end = new Date(this.endDate); // This is safe now because we ensured it's not null
            land = land.filter((room) => {
              const createdAt = new Date(room.createdAt);
              return createdAt <= end;
            });
          }

          // Set the filtered land to the data source
          this.dataSource.data = land;
          this.pagingModel = response.result; // Capture pagination data
          this.dataSource.data.forEach((room) => this.loadImage(room));
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching room data', error);
        this.loading = false;
      }
    );
  }

  viewLandData(room: Land): void {
    const dialogRef = this.dialog.open(ViewLandComponent, {
      width: '800px',
      data: room, // Pass house data to the dialog component
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Handle any actions after the dialog is closed (if needed)
        console.log('Dialog closed:', result);
      }
    });
  }
  onSearch(): void {
    this.currentPage = 0; // Reset to the first page on a new search
    this.fetchLand(this.searchTerm); // Pass searchTerm to fetchLand
  }
  clearSearch(): void {
    this.searchTerm = ''; // Clear the search term
    this.startDate = null; // Clear start date
    this.endDate = null; // Clear end date
    this.currentPage = 0; // Reset to the first page
    this.fetchLand(); // Fetch all data without filters
  }

  getStatus(createdAt: string): { text: string; className: string } {
    const today = new Date();
    const roomDate = new Date(createdAt);

    // Calculate the difference in milliseconds
    const timeDiff = today.getTime() - roomDate.getTime();

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
      return {
        text: `${Math.floor(dayDiff / 7)} weeks ago`,
        className: 'status-week-old',
      }; // Added within the last month
    } else if (dayDiff < 365) {
      return {
        text: `${Math.floor(dayDiff / 30)} months ago`,
        className: 'status-month-old',
      }; // Added within the last year
    } else {
      return {
        text: `${Math.floor(dayDiff / 365)} years ago`,
        className: 'status-old',
      }; // Added more than a year ago
    }
  }

  applyFilter(searchValue: string): void {
    this.fetchLand(searchValue); // Call fetchRoom with the search value
  }

  clearFilter(searchInput: HTMLInputElement): void {
    searchInput.value = ''; // Clear the input field
    this.applyFilter(''); // Reset the filter to show all land
  }
  pageChanged(event: PageEvent): void {
    this.size = event.pageSize;
    this.currentPage = event.pageIndex;
    this.fetchLand(); // Re-fetch land on page change
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
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.deleteland(land);
      }
    });
  }

  // Handle land deletion
  deleteland(land: Land): void {
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
        imagePath: land.imagePaths, // Ensure the correct imagePath is passed
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchLand();
      }
    });
  }
}
