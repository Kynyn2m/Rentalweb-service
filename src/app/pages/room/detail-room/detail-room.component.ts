import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  DomSanitizer,
  SafeResourceUrl,
  SafeUrl,
} from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { VillageService } from 'src/app/address/village.service';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { ImageDialogComponent } from 'src/app/details/image-dialog.component';
import { RoomService } from 'src/app/Service/room.service';
import Swal from 'sweetalert2';
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
interface UserComment {
  id: number;
  userId: number;
  name: string;
  description: string;
  imagePath: string;
  replies: UserReply[];
  totalReply: number;
}

interface UserReply {
  id: number;
  userId: number;
  name: string;
  description: string;
  imagePath: string;
  replies: UserReply[];
  totalReply: number;
}
interface Location {
  id: number;
  englishName: string;
  khmerName: string;
}

interface PaggingModel<T> {
  totalPage: number;
  totalElements: number;
  currentPage: number;
  result: T[];
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
  isLoading: boolean = false;
  comments: UserComment[] = [];
  newCommentText: string = '';
  replyText: { [key: number]: string } = {};
  activeMenu: number | null = null;
  urlSafe!: SafeResourceUrl;
  linkMap: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private roomService: RoomService,
    private dialog: MatDialog,
    private districtService: DistrictService,
    private communeService: CommuneService,
    private villageService: VillageService,
    private cdr: ChangeDetectorRef,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const roomIdParam = this.route.snapshot.paramMap.get('id');
    const roomId = roomIdParam ? parseInt(roomIdParam, 10) : null;

    if (roomId) {
      this.getRoomDetails(roomId);
      this.loadComments(roomId);
    } else {
      console.error('Invalid room ID');
    }
  }

  loadComments(roomId: number): void {
    this.isLoading = true;
    this.roomService.getComments(roomId).subscribe(
      (response) => {
        if (response.code === 200) {
          this.comments = response.result.result as UserComment[];
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading comments:', error);
        this.isLoading = false;
      }
    );
  }

  postComment(): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to post a comment.',
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }
    if (!this.newCommentText.trim()) return;

    const roomId = this.room?.id ?? 34;
    const type = 'room';
    const description = this.newCommentText;

    this.isLoading = true;
    this.roomService.postComment(roomId, description, type).subscribe(
      (response) => {
        if (response) {
          this.loadComments(roomId); // Reload comments to fetch latest data
          this.newCommentText = ''; // Clear input field
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error posting comment:', error);
        this.isLoading = false;
      }
    );
  }

  sendReply(commentId: number): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to reply to this comment.',
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    const description = this.replyText[commentId];
    if (!description) return;

    this.isLoading = true;
    this.roomService.replyToComment(commentId, description).subscribe(
      (response) => {
        if (response) {
          const roomId = this.room?.id ?? 34;
          this.loadComments(roomId); // Reload comments to fetch latest data
          this.replyText[commentId] = ''; // Clear reply input
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error posting reply:', error);
        this.isLoading = false;
      }
    );
  }
  toggleMenu(commentId: number): void {
    this.activeMenu = this.activeMenu === commentId ? null : commentId;
  }

  deleteComment(commentId: number): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to delete a comment.',
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return; // Exit if the user is not logged in
    }
    this.isLoading = true;
    this.roomService.deleteComment(commentId).subscribe(
      () => {
        const roomId = this.room?.id ?? 34;
        this.loadComments(roomId); // Reload comments to update the list
        this.activeMenu = null;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error deleting comment:', error);
        this.isLoading = false;
      }
    );
  }

  getRoomDetails(id: number): void {
    // Change id type to number
    this.roomService.getRoomById(id.toString()).subscribe(
      (response) => {
        this.room = response.result as Room;
        if (this.room) {
          this.loadImages(this.room);
          this.fetchLocationDetails(
            this.room.province,
            this.room.district,
            this.room.commune,
            this.room.village
          );

          if (this.room.linkMap) {
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://maps.google.com/maps?q=${encodeURIComponent(
                this.room.linkMap
              )}&output=embed`
            );
            this.linkMap = this.room.linkMap;
          }
        }
      },
      (error) => {
        console.error('Error fetching room details:', error);
      }
    );
  }

  setDefaultMapUrl(): void {
    // Set the default map to Phnom Penh coordinates if no specific link is available
    const url = `https://maps.google.com/maps?q=11.5564,104.9282&z=14&output=embed`;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  setMapUrl(): void {
    // Set the URL to display Phnom Penh, Cambodia, on the map
    const url = `https://maps.google.com/maps?q=11.5564,104.9282&z=14&output=embed`;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
              this.currentImage = safeUrl;
            }
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
    }
  }

  fetchLocationDetails(
    provinceId: number,
    districtId: number,
    communeId: number,
    villageId: number
  ): void {
    this.districtService.getProvincesPublic().subscribe((res) => {
      const paginatedResponse = res as PaggingModel<Location>;
      const provinceIdNumber = Number(provinceId); // Convert provinceId to a number

      const province = Array.isArray(paginatedResponse.result)
        ? paginatedResponse.result.find((p) => p.id === provinceIdNumber)
        : null; // Compare as numbers
      // console.log("res", res);

      // console.log('Province ID:', provinceIdNumber); // Log the ID
      // console.log('Provinces array:', paginatedResponse.result); // Log the provinces array
      // console.log('Found province:', province); // Log the found province
      // console.log('Province Khmer Name:', province ? province.khmerName : 'Not Found'); // Log the Khmer name

      console.log('province response:', province);

      this.provinceName = province
        ? province.khmerName || province.englishName
        : 'Unknown Province';
      this.cdr.detectChanges();
    });

    this.districtService.getByProvincePublic(provinceId).subscribe((res) => {
      console.log('Districts response:', res);
      const paginatedResponse = res as PaggingModel<Location>;
      const district = Array.isArray(paginatedResponse.result)
        ? paginatedResponse.result.find((d) => d.id === districtId)
        : null;
      this.districtName = district
        ? district.khmerName || district.englishName
        : 'Unknown District';
      this.cdr.detectChanges();
    });

    this.communeService.getByDistrictPublic(districtId).subscribe((res) => {
      console.log('Communes response:', res);
      const paginatedResponse = res as PaggingModel<Location>;
      const commune = Array.isArray(paginatedResponse.result)
        ? paginatedResponse.result.find((c) => c.id === communeId)
        : null;
      this.communeName = commune
        ? commune.khmerName || commune.englishName
        : 'Unknown Commune';
      this.cdr.detectChanges();
    });

    this.villageService.getByCommunePublic(communeId).subscribe((res) => {
      console.log('Villages response:', res);
      const paginatedResponse = res as PaggingModel<Location>;
      const village = Array.isArray(paginatedResponse.result)
        ? paginatedResponse.result.find((v) => v.id === villageId)
        : null;
      this.villageName = village
        ? village.khmerName || village.englishName
        : 'Unknown Village';
      this.cdr.detectChanges();
    });
  }

  openImageInFullScreen(image: SafeUrl): void {
    this.dialog.open(ImageDialogComponent, {
      data: { image },
      panelClass: 'full-screen-modal',
    });
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
