import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { ProvinceService } from 'src/app/address/province.service';
import { VillageService } from 'src/app/address/village.service';
import { RoomService } from 'src/app/Service/room.service';

@Component({
  selector: 'app-update-room-dialog',
  templateUrl: './update-room-dialog.component.html',
  styleUrls: ['./update-room-dialog.component.css'],
})
export class UpdateRoomDialogComponent {
  roomData: any; // The room data passed into the dialog
  provinces: any[] = [];
  districts: any[] = [];
  communes: any[] = [];
  villages: any[] = [];
  imagePreview: SafeUrl | null = null; // Change type to SafeUrl
  selectedFile: File | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private districtService: DistrictService,
    private communeService: CommuneService,
    private villageService: VillageService,
    private provinceService: ProvinceService,
    private roomService: RoomService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UpdateRoomDialogComponent>,
    private sanitizer: DomSanitizer // Inject DomSanitizer
  ) {
    this.roomData = data.roomData || {};
  }

  ngOnInit(): void {
    console.log('Room data:', this.roomData);

    // Fetch provinces when the dialog opens
    this.fetchProvinces();

    // Load existing room data and populate form fields if they exist
    if (this.roomData.province) {
      this.roomData.provinceId = this.roomData.province; // Bind province to provinceId
      this.onProvinceSelected(this.roomData.provinceId); // Ensure districts load as well
    }

    if (this.roomData.district) {
      // This will load communes based on the selected district
      this.onDistrictSelected(this.roomData.district);
    }

    if (this.roomData.commune) {
      // This will load villages based on the selected commune
      this.onCommuneSelected(this.roomData.commune);
    }

    // If there's an image, sanitize and display the first one as a preview
    if (this.roomData.imagePaths && this.roomData.imagePaths.length > 0) {
      this.loadImage(this.roomData, 'room'); // Use 'room' as the type
    }
  }

  fetchProvinces(): void {
    this.provinceService.getAllPublic().subscribe((res) => {
      this.provinces = res.result.result || [];

      if (this.roomData.provinceId) {
        console.log(
          'Selected Province after fetching:',
          this.roomData.provinceId
        ); // Check if provinceId is correct
      }
    });
  }

  onProvinceSelected(provinceId: number): void {
    if (provinceId) {
      this.districtService.getByProvincePublic(provinceId).subscribe(
        (res) => {
          this.districts = res.result || [];

          // Pre-select district if it exists in roomData
          if (this.roomData.district) {
            this.roomData.districtId = this.roomData.district; // Pre-select the district
            this.onDistrictSelected(this.roomData.districtId); // Trigger commune loading
          }

          // Clear communes and villages when the province changes
          this.communes = [];
          this.villages = [];
          this.roomData.communeId = null;
          this.roomData.villageId = null;
        },
        (error) => {
          console.error('Error fetching districts:', error);
        }
      );
    }
  }

  onDistrictSelected(districtId: number): void {
    if (districtId) {
      this.communeService.getByDistrictPublic(districtId).subscribe(
        (res) => {
          this.communes = res.result || [];

          // Pre-select commune if it exists in roomData
          if (this.roomData.commune) {
            this.roomData.communeId = this.roomData.commune; // Pre-select the commune
            this.onCommuneSelected(this.roomData.communeId); // Trigger village loading
          }

          // Clear villages when the district changes
          this.villages = [];
          this.roomData.villageId = null;
        },
        (error) => {
          console.error('Error fetching communes:', error);
        }
      );
    }
  }

  onCommuneSelected(communeId: number): void {
    if (communeId) {
      this.villageService.getByCommunePublic(communeId).subscribe(
        (res) => {
          this.villages = res.result || [];

          // Pre-select village if it exists in roomData
          if (this.roomData.village) {
            this.roomData.villageId = this.roomData.village; // Pre-select the village
          }
        },
        (error) => {
          console.error('Error fetching villages:', error);
        }
      );
    }
  }

  loadImage(item: any, type: string): void {
    item.safeImagePaths = []; // Initialize an array for sanitized image URLs
    item.currentImageIndex = 0; // Start showing the first image

    // Loop through the array of imagePaths and sanitize each one
    if (item.imagePaths && item.imagePaths.length > 0) {
      item.imagePaths.forEach((imagePath: string) => {
        this.roomService.getImage(imagePath).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            item.safeImagePaths.push(safeUrl); // Push sanitized URLs to the array
          },
          (error) => {
            console.error(
              `Error loading ${type} image for item with ID: ${
                item.id || 'unknown'
              }`,
              error
            );
            item.safeImagePaths.push('/assets/img/default-placeholder.png'); // Add a placeholder if image loading fails
          }
        );
      });
    } else {
      item.safeImagePaths.push('/assets/img/default-placeholder.png'); // Add a placeholder if no image exists
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file; // Store the selected file
      console.log('Selected file:', this.selectedFile); // Log the selected file

      // Handle file preview logic
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        console.log('Image preview:', this.imagePreview); // Log the image preview
      };
      reader.readAsDataURL(file);
    }
  }
  cancelImage(): void {
    this.selectedFile = null; // Reset the selected file
    this.imagePreview = null; // Clear the image preview
  }

  save(): void {
    // Prepare the room data to be sent to the API
    const roomUpdateData: any = {
      title: this.roomData.title,
      description: this.roomData.description,
      price: this.roomData.price,
      phoneNumber: this.roomData.phoneNumber,
      linkMap: this.roomData.linkMap,
      floor: this.roomData.floor,
      width: this.roomData.width,
      height: this.roomData.height,
      provinceId: this.roomData.provinceId,
      districtId: this.roomData.districtId,
      communeId: this.roomData.communeId,
      villageId: this.roomData.villageId,
    };

    // Create FormData to send to the API
    const formData = new FormData();
    for (const key in roomUpdateData) {
      if (roomUpdateData.hasOwnProperty(key)) {
        formData.append(key, roomUpdateData[key]);
      }
    }

    // If a file is selected, append it to the form data
    if (this.selectedFile) {
      formData.append('images', this.selectedFile);
      console.log('Appended image to FormData:', this.selectedFile); // Log the appended file
    }

    // Call the updateRoom method from the room service
    this.roomService.updateRoom(this.roomData.id, formData).subscribe(
      (response) => {
        console.log('Room updated successfully', response);
        this.dialogRef.close({ success: true });
        this.snackBar.open('Room updated successfully', 'Close', {
          duration: 3000,
        });
      },
      (error) => {
        console.error('Error updating room:', error);
        this.snackBar.open('Error updating room', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  cancel(): void {
    this.dialogRef.close({ success: false });
  }
}
