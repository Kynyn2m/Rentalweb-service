import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { VillageService } from 'src/app/address/village.service';
import { ImageDialogComponent } from 'src/app/details/image-dialog.component';
import { RoomService } from 'src/app/Service/room.service';
interface Room {
  id: number;
  likeCount: number;
  liked: boolean;
  // Add the pending flag
  pending?: boolean;
}
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
  province: number;
  district: number;
  commune: number;
  village: number;
}
@Component({
  selector: 'app-detail-room',
  templateUrl: './detail-room.component.html',
  styleUrls: ['./detail-room.component.css'],
})
export class DetailRoomComponent {
  room: Room | null = null;
  selectedImage: SafeUrl | null = null;
  provinceName: string = '';
  districtName: string = '';
  communeName: string = '';
  villageName: string = '';
  currentImage: SafeUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private roomService: RoomService,
    private dialog: MatDialog,
    private districtService: DistrictService,
    private communeService: CommuneService,
    private villageService: VillageService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.getRoomDetails(roomId);
    }
  }
  getRoomDetails(id: string): void {
    this.roomService.getRoomById(id).subscribe(
      (response) => {
        this.room = response.result as Room;
        if (this.room) {
          this.loadImages(this.room);
          this.fetchLocationDetails(this.room.province, this.room.district, this.room.commune, this.room.village);
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
            if (!this.currentImage) {
              this.currentImage = safeUrl; // Set the first image as the current image
            }
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
    }
  }


  fetchLocationDetails(provinceId: number, districtId: number, communeId: number, villageId: number): void {
    // Fetch province name
    this.districtService.getProvincesPublic().subscribe((res) => {
      const province = res.result.find((p: any) => p.id === provinceId);
      this.provinceName = province ? province.khmerName || province.englishName : 'Unknown Province';

      // Manually trigger change detection after setting the value
      this.cdr.detectChanges();
    });

    // Fetch district name
    this.districtService.getByProvincePublic(provinceId).subscribe((res) => {
      const district = res.result.find((d: any) => d.id === districtId);
      this.districtName = district ? district.khmerName || district.englishName : 'Unknown District';

      // Manually trigger change detection after setting the value
      this.cdr.detectChanges();
    });

    // Fetch commune name
    this.communeService.getByDistrictPublic(districtId).subscribe((res) => {
      const commune = res.result.find((c: any) => c.id === communeId);
      this.communeName = commune ? commune.khmerName || commune.englishName : 'Unknown Commune';

      // Manually trigger change detection after setting the value
      this.cdr.detectChanges();
    });

    // Fetch village name
    this.villageService.getByCommunePublic(communeId).subscribe((res) => {
      const village = res.result.find((v: any) => v.id === villageId);
      this.villageName = village ? village.khmerName || village.englishName : 'Unknown Village';

      // Manually trigger change detection after setting the value
      this.cdr.detectChanges();
    });
  }

  openImageInFullScreen(image: SafeUrl): void {
    this.dialog.open(ImageDialogComponent, {
      data: { image },
      panelClass: 'full-screen-modal',
    });
  }

  likeRoom(roomId: number): void {
    if (!this.room || this.room.pending) return; // Ensure no pending request or null room

    this.room.pending = true; // Set the pending state to prevent multiple clicks

    if (this.room.liked) {
      // Simulate "unlike" (no API call here)
      this.room.likeCount -= 1;
      this.room.liked = false;
      this.room.pending = false; // Reset pending state after local unlike
    } else {
      // Call the like API
      this.roomService.likeRoom(roomId).subscribe(() => {
        this.room!.likeCount += 1;  // Increment the like count
        this.room!.liked = true;    // Set liked state to true
        this.room!.pending = false; // Reset pending state after API call
      }, () => {
        // Handle error case
        this.room!.pending = false; // Reset pending state even on error
      });
    }
  }
  previousImage(): void {
    if (this.room && this.room.safeImagePaths) {
      const index = this.room.safeImagePaths.indexOf(this.currentImage!);
      if (index > 0) {
        this.currentImage = this.room.safeImagePaths[index - 1];
      }
    }
  }

  nextImage(): void {
    if (this.room && this.room.safeImagePaths) {
      const index = this.room.safeImagePaths.indexOf(this.currentImage!);
      if (index < this.room.safeImagePaths.length - 1) {
        this.currentImage = this.room.safeImagePaths[index + 1];
      }
    }
  }
  selectImage(image: SafeUrl): void {
    this.currentImage = image;
  }

  goBack(): void {
    window.history.back();
  }
}
