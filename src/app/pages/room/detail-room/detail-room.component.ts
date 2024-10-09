import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ImageDialogComponent } from 'src/app/details/image-dialog.component';
import { RoomService } from 'src/app/Service/room.service';
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
  safeImagePaths?: SafeUrl[];
  likeCount: number;
  linkMap: string;
  viewCount: number;
  createdAt: string;
}
@Component({
  selector: 'app-detail-room',
  templateUrl: './detail-room.component.html',
  styleUrls: ['./detail-room.component.css'],
})
export class DetailRoomComponent {
  room: Room | null = null;
  selectedImage: SafeUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private roomService: RoomService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.getHouseDetails(roomId);
    }
  }

  getHouseDetails(id: string): void {
    this.roomService.getRoomById(id).subscribe(
      (response) => {
        this.room = response.result as Room;
        if (this.room) {
          this.loadImages(this.room);
        }
      },
      (error) => {
        console.error('Error fetching room details:', error);
      }
    );
  }

  loadImages(room: Room): void {
    if (room.imagePaths && room.imagePaths.length > 0) {
      room.safeImagePaths = [];
      room.imagePaths.forEach((imagePath) => {
        this.roomService.getImage(imagePath).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            room.safeImagePaths!.push(safeUrl);
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
    }
  }

  // Open the image in the full-screen dialog
  openImageInFullScreen(image: SafeUrl): void {
    this.dialog.open(ImageDialogComponent, {
      data: { image },
      panelClass: 'full-screen-modal',
    });
  }

  likeHouse(roomId: number): void {
    if (!this.room) return;

    this.roomService.likeRoom(roomId).subscribe(() => {
      this.room!.likeCount += 1;
    });
  }

  goBack(): void {
    window.history.back();
  }
}
