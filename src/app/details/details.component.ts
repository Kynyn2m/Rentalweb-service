 import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HouseService } from '../Service/house.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from './image-dialog.component';
import { DistrictService } from '../address/district.service';
import { CommuneService } from '../address/commune.service';
import { VillageService } from '../address/village.service';


/** Interfaces */
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
  safeImagePaths?: SafeUrl[];
  likeCount: number;
  linkMap: string;
  viewCount: number;
  createdAt: string;
  province: number;
  district: number;
  commune: number;
  village: number;
  liked: boolean;
  pending?: boolean;
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
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit {
  house: House | null = null;
  selectedImage: SafeUrl | null = null;
  provinceName: string = '';
  districtName: string = '';
  communeName: string = '';
  villageName: string = '';
  currentImage: SafeUrl | null = null;
  urlSafe!: SafeResourceUrl;
  linkMap: string | null = null;
  comments: UserComment[] = [];
  replyText: { [key: number]: string } = {};
  newCommentText: string = '';
  activeMenu: number | null = null;








  constructor(
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    private readonly houseService: HouseService,
    private readonly dialog: MatDialog,
    private readonly districtService: DistrictService,
    private readonly communeService: CommuneService,
    private readonly villageService: VillageService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.setDefaultMapUrl();

  }

  ngOnInit(): void {
    const houseIdParam = this.route.snapshot.paramMap.get('id');
    const houseId = houseIdParam ? parseInt(houseIdParam, 10) : null;

    if (houseId) {
      this.getHouseDetails(houseId);
      this.loadComments(houseId);
    } else {
      console.error('Invalid house ID');
    }
  }

  postComment(): void {
    if (!this.newCommentText.trim()) return;

    const houseId = this.house?.id ?? 34; // Adjust as needed
    const type = 'house';
    const description = this.newCommentText;

    this.houseService.postComment(houseId, description, type).subscribe(
      (response) => {
        if (response) {
          // Add the new comment from the response to the top of the comments list
          const newComment: UserComment = {
            id: response.id,
            userId: response.userId,
            name: response.name, // Ensure this field is set correctly
            description: response.description,
            imagePath: response.imagePath, // Ensure this field is set correctly
            replies: [],
            totalReply: 0
          };
          this.comments.unshift(newComment); // Update UI with the new comment
          this.newCommentText = ''; // Clear the input field
        }
      },
      (error) => {
        console.error('Error posting comment:', error);
      }
    );
  }


  loadComments(houseId: number): void {
    this.houseService.getComments(houseId).subscribe(response => {
      if (response.code === 200) {
        this.comments = response.result.result as UserComment[];
      }
    });
  }

  sendReply(commentId: number): void {
    const description = this.replyText[commentId];
    if (!description) return;

    this.houseService.replyToComment(commentId, description).subscribe(
      (response) => {
        if (response) {
          // Find the parent comment and add the new reply from the response
          const parentComment = this.comments.find(c => c.id === commentId);
          if (parentComment) {
            parentComment.replies.push({
              id: response.id,
              userId: response.userId,
              name: response.name, // Ensure this field is set correctly
              description: response.description,
              imagePath: response.imagePath, // Ensure this field is set correctly
              replies: [],
              totalReply: 0
            });
            parentComment.totalReply += 1; // Update reply count if needed
            this.replyText[commentId] = ''; // Clear the reply input
          }
        }
      },
      (error) => {
        console.error('Error posting reply:', error);
      }
    );
  }

  toggleMenu(commentId: number): void {
    this.activeMenu = this.activeMenu === commentId ? null : commentId; // Toggle the menu
  }

  deleteComment(commentId: number): void {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.houseService.deleteComment(commentId).subscribe(
      () => {
        // Remove the comment from the UI after successful deletion
        this.comments = this.comments.filter(comment => comment.id !== commentId);
        this.activeMenu = null; // Close the menu after deletion
      },
      (error) => {
        console.error('Error deleting comment:', error);
      }
    );
  }


  getHouseDetails(id: number): void { // Change id type to number
    this.houseService.getHouseById(id.toString()).subscribe(
      (response) => {
        this.house = response.result as House;
        if (this.house) {
          this.loadImages(this.house);
          this.fetchLocationDetails(this.house.province, this.house.district, this.house.commune, this.house.village);

          if (this.house.linkMap) {
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://maps.google.com/maps?q=${encodeURIComponent(this.house.linkMap)}&output=embed`
            );
            this.linkMap = this.house.linkMap;
          }
        }
      },
      (error) => {
        console.error('Error fetching house details:', error);
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
  loadImages(house: House): void {
    if (house.imagePaths && house.imagePaths.length > 0) {
      house.safeImagePaths = [];
      house.imagePaths.forEach((imagePath) => {
        this.houseService.getImage(imagePath).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            house.safeImagePaths!.push(safeUrl);
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

  fetchLocationDetails(provinceId: number, districtId: number, communeId: number, villageId: number): void {
    this.districtService.getProvincesPublic().subscribe((res) => {
      const paginatedResponse = res as PaggingModel<Location>;
      const provinceIdNumber = Number(provinceId); // Convert provinceId to a number

      const province = Array.isArray(paginatedResponse.result) ?
        paginatedResponse.result.find((p) => p.id === provinceIdNumber) : null; // Compare as numbers
      // console.log("res", res);



      // console.log('Province ID:', provinceIdNumber); // Log the ID
      // console.log('Provinces array:', paginatedResponse.result); // Log the provinces array
      // console.log('Found province:', province); // Log the found province
      // console.log('Province Khmer Name:', province ? province.khmerName : 'Not Found'); // Log the Khmer name

      console.log('province response:', province);


      this.provinceName = province ? (province.khmerName || province.englishName) : 'Unknown Province';
      this.cdr.detectChanges();
    });

    this.districtService.getByProvincePublic(provinceId).subscribe((res) => {
      console.log('Districts response:', res);
      const paginatedResponse = res as PaggingModel<Location>;
      const district = Array.isArray(paginatedResponse.result) ? paginatedResponse.result.find((d) => d.id === districtId) : null;
      this.districtName = district ? district.khmerName || district.englishName : 'Unknown District';
      this.cdr.detectChanges();
    });

    this.communeService.getByDistrictPublic(districtId).subscribe((res) => {
      console.log('Communes response:', res);
      const paginatedResponse = res as PaggingModel<Location>;
      const commune = Array.isArray(paginatedResponse.result) ? paginatedResponse.result.find((c) => c.id === communeId) : null;
      this.communeName = commune ? commune.khmerName || commune.englishName : 'Unknown Commune';
      this.cdr.detectChanges();
    });

    this.villageService.getByCommunePublic(communeId).subscribe((res) => {
      console.log('Villages response:', res);
      const paginatedResponse = res as PaggingModel<Location>;
      const village = Array.isArray(paginatedResponse.result) ? paginatedResponse.result.find((v) => v.id === villageId) : null;
      this.villageName = village ? village.khmerName || village.englishName : 'Unknown Village';
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
    if (this.house && this.house.safeImagePaths) {
      const index = this.house.safeImagePaths.indexOf(this.currentImage!);
      if (index > 0) {
        this.currentImage = this.house.safeImagePaths[index - 1];
      }
    }
  }

  nextImage(): void {
    if (this.house && this.house.safeImagePaths) {
      const index = this.house.safeImagePaths.indexOf(this.currentImage!);
      if (index < this.house.safeImagePaths.length - 1) {
        this.currentImage = this.house.safeImagePaths[index + 1];
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
