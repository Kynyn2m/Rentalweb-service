import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { RoomService } from 'src/app/Service/room.service';
import { RoomFormComponent } from './room-form/room-form.component';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { PaggingModel } from 'src/app/_helpers/response-model';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ViewRoomComponent } from './view-room/view-room.component';

interface Room {
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
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css'],
})
export class RoomListComponent implements OnInit {
  displayedColumns: string[] = [
    'image',
    'title',
    'likeCount',
    'viewCount',
    'createdAt',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<Room>([]);
  loading: boolean = true;
  pagingModel?: PaggingModel;
  size = environment.pageSize;
  pageSizeOptions: number[] = environment.pageSizeOptions;
  currentPage = 0;
  page = environment.currentPage;
  searchTerm: string = ''; // Added search term
  startDate: string | null = null; // For the start date
  endDate: string | null = null; // For the end date
  constructor(
    private roomService: RoomService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchRoom(); // Initial fetch without search
  }

  fetchRoom(search?: string): void {
    this.loading = true;

    const params = {
      page: this.currentPage,
      size: this.size,
      search: search || '', // Include the search term if provided
    };

    this.roomService.getRooms(params).subscribe(
      (response) => {
        if (response.code === 200) {
          let rooms = response.result.result as Room[];

          // Apply date filters if provided
          if (this.startDate && this.startDate !== '') {
            const start = new Date(this.startDate); // This is safe now because we ensured it's not null
            rooms = rooms.filter((room) => {
              const createdAt = new Date(room.createdAt);
              return createdAt >= start;
            });
          }

          if (this.endDate && this.endDate !== '') {
            const end = new Date(this.endDate); // This is safe now because we ensured it's not null
            rooms = rooms.filter((room) => {
              const createdAt = new Date(room.createdAt);
              return createdAt <= end;
            });
          }

          // Set the filtered rooms to the data source
          this.dataSource.data = rooms;
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
  onSearch(): void {
    this.currentPage = 0; // Reset to the first page on a new search
    this.fetchRoom(this.searchTerm); // Pass searchTerm to fetchRooms
  }
  clearSearch(): void {
    this.searchTerm = ''; // Clear the search term
    this.startDate = null; // Clear start date
    this.endDate = null; // Clear end date
    this.currentPage = 0; // Reset to the first page
    this.fetchRoom(); // Fetch all data without filters
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
    this.fetchRoom(searchValue); // Call fetchRoom with the search value
  }

  clearFilter(searchInput: HTMLInputElement): void {
    searchInput.value = ''; // Clear the input field
    this.applyFilter(''); // Reset the filter to show all rooms
  }

  pageChanged(event: PageEvent): void {
    this.size = event.pageSize;
    this.currentPage = event.pageIndex;
    this.fetchRoom(); // Re-fetch rooms on page change
  }

  loadImage(room: Room): void {
    if (!room.imagePaths || room.imagePaths.length === 0) return;

    const firstImagePath = room.imagePaths[0];
    this.roomService.getImage(firstImagePath).subscribe(
      (imageBlob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        room.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      (error) => {
        console.error('Error loading image:', error);
      }
    );
  }

  viewRoomData(room: Room): void {
    const dialogRef = this.dialog.open(ViewRoomComponent, {
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
  openDeleteDialog(room: Room): void {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      width: '400px',
      data: {
        title: 'Delete Room',
        message: `Are you sure you want to delete the room: ${room.title}?`,
        confirmText: 'Yes, Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.deleteRoom(room);
      }
    });
  }

  deleteRoom(room: Room): void {
    this.roomService.deleteRoom(room.id).subscribe(
      () => {
        this.snackBar.open(`${room.title} has been deleted.`, 'Close', {
          duration: 3000,
        });
        this.fetchRoom(); // Refresh the list after deletion
      },
      (error) => {
        console.error('Error deleting room:', error);
        this.snackBar.open(`Failed to delete ${room.title}.`, 'Close', {
          duration: 3000,
        });
      }
    );
  }

  openUpdateDialog(room: Room): void {
    const dialogRef = this.dialog.open(RoomFormComponent, {
      width: '600px',
      data: {
        ...room,
        imagePath: room.imagePaths,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchRoom();
      }
    });
  }
}
