import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { RoomService } from 'src/app/Service/room.service';
import { RoomFormComponent } from './room-form/room-form.component';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { PaggingModel } from 'src/app/_helpers/response-model';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
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
export class RoomListComponent {
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
  room: Room[] = [];
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
    this.fetchRoom();
  }

  fetchRoom(): void {
    this.loading = true; // Start loading
    this.roomService.getRooms().subscribe(
      response => {
        if (response.code === 200) {
          this.room = response.result.result as Room[];
          this.room.forEach(room => this.loadImage(room));
        }
        this.loading = false; // Stop loading after fetch
      },
      error => {
        console.error('Error fetching room data', error);
        this.loading = false; // Stop loading on error
      }
    );
  }
  pageChanged(event: PageEvent): void {
    this.size = event.pageSize;
    this.currentPage = event.pageIndex;
    this.fetchRoom();
  }
  loadImage(room: Room): void {
    if (!room.imagePaths || room.imagePaths.length === 0) {
      console.error('No image paths available for room:', room);
      return;
    }

    const firstImagePath = room.imagePaths[0]; // Use the first image for display

    this.roomService.getImage(firstImagePath).subscribe(
      (imageBlob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        room.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        console.log('Image loaded:', room.safeImagePath);
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
        title: 'Delete House',
        message: `Are you sure you want to delete the room: ${room.title}?`,
        confirmText: 'Yes, Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteHouse(room);
      }
    });
  }

  // Handle room deletion
  deleteHouse(room: Room): void {
    this.roomService.deleteRoom(room.id).subscribe(
      (response) => {
        this.snackBar.open(`${room.title} has been deleted.`, 'Close', { duration: 3000 });
        this.fetchRoom(); // Refresh the list after deletion
      },
      (error) => {
        console.error('Error deleting room:', error);
        this.snackBar.open(`Failed to delete ${room.title}.`, 'Close', { duration: 3000 });
      }
    );
  }
  openUpdateDialog(room: Room): void {
    const dialogRef = this.dialog.open(RoomFormComponent, {
      width: '600px',
      data: {
        ...room,
        imagePath: room.imagePaths // Ensure the correct imagePath is passed
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchRoom();
      }
    });
  }
}
