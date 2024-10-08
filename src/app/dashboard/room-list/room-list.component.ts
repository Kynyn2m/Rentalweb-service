import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { RoomService } from 'src/app/Service/room.service';
import { RoomFormComponent } from './room-form/room-form.component';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
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
  imagePath: string;
  safeImagePath?: SafeUrl; // Safe image URL after sanitization
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
    this.roomService.getRooms().subscribe(
      (response) => {
        if (response.code === 200) {
          this.room = response.result.result as Room[];
          this.room.forEach((room) => this.loadImage(room)); // Load and sanitize images
        }
      },
      (error) => {
        console.error('Error fetching room data', error);
      }
    );
  }

  loadImage(room: Room): void {
    this.roomService.getImage(room.imagePath).subscribe(
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
      (response) => {
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
        imagePath: room.imagePath, // Ensure the correct imagePath is passed
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fetchRoom();
      }
    });
  }
}
