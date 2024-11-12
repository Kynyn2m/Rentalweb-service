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
  dataSource = new MatTableDataSource<Room>([]);
  loading: boolean = true;
  pagingModel?: PaggingModel;
  size = environment.pageSize;
  pageSizeOptions: number[] = environment.pageSizeOptions;
  currentPage = 0;
  page = environment.currentPage;

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
          this.dataSource.data = response.result.result as Room[];
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
