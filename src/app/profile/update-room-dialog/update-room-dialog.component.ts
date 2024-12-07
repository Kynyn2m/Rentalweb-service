import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { ProvinceService } from 'src/app/address/province.service';
import { VillageService } from 'src/app/address/village.service';
import { RoomService } from 'src/app/Service/room.service';
import * as L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

@Component({
  selector: 'app-update-room-dialog',
  templateUrl: './update-room-dialog.component.html',
  styleUrls: ['./update-room-dialog.component.css'],
})
export class UpdateRoomDialogComponent {
  map: any;
  userMarker: any;
  roomData: any; // The room data passed into the dialog
  provinces: any[] = [];
  districts: any[] = [];
  communes: any[] = [];
  villages: any[] = [];
  imagePreview: SafeUrl | null = null; // Change type to SafeUrl
  selectedFile: File | null = null;

  existingImagePaths: string[] = [];

  selectedFiles: File[] = []; // Array to hold multiple selected files
  imagePreviews: SafeUrl[] = []; // Array for image previews
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
    this.initializeMap();
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
      this.loadImages(this.roomData.imagePaths); // Load and sanitize image paths
    }
  }

  initializeMap(): void {
    this.map = L.map('map').setView([11.562108, 104.888535], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    if (this.roomData.linkMap) {
      const [lat, lng] = this.getCoordinatesFromLinkMap(this.roomData.linkMap);
      this.addUserMarker(lat, lng);
    }

    this.map.on('click', (event: any) => {
      const { lat, lng } = event.latlng;
      this.addUserMarker(lat, lng);
    });
  }

  getCoordinatesFromLinkMap(linkMap: string): [number, number] {
    const match = /q=(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/.exec(linkMap);
    if (match) {
      return [parseFloat(match[1]), parseFloat(match[3])];
    }
    return [11.562108, 104.888535];
  }

  addUserMarker(lat: number, lng: number): void {
    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }

    this.userMarker = L.marker([lat, lng], {
      draggable: true,
      icon: defaultIcon,
    }).addTo(this.map);
    this.map.setView([lat, lng], 12);
    this.updateMapLink(lat, lng);

    this.userMarker.on('dragend', (event: any) => {
      const position = event.target.getLatLng();
      this.updateMapLink(position.lat, position.lng);
    });
  }

  updateMapLink(lat: number, lng: number): void {
    this.roomData.linkMap = `https://www.google.com/maps?q=${lat},${lng}`;
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

  loadImages(imagePaths: string[]): void {
    this.existingImagePaths = [...imagePaths];
    this.imagePreviews = []; // Clear existing previews
    imagePaths.forEach((imagePath) => {
      this.roomService.getImage(imagePath).subscribe(
        (imageBlob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.imagePreviews.push(safeUrl); // Push sanitized URLs to the array
        },
        (error) => {
          console.error('Error loading image:', error);
          this.imagePreviews.push(
            this.sanitizer.bypassSecurityTrustUrl(
              '/assets/img/default-placeholder.png'
            )
          ); // Add a placeholder if image loading fails
        }
      );
    });
  }

  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        this.selectedFiles.push(file as File); // Add each file to the selectedFiles array
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const previewUrl = this.sanitizer.bypassSecurityTrustUrl(
            e.target.result
          );
          this.imagePreviews.push(previewUrl); // Add preview to the imagePreviews array
        };
        reader.readAsDataURL(file as File);
      });
    }
  }

  // Cancel (remove) image preview and selected file
  cancelImage(index: number): void {
    this.selectedFiles.splice(index, 1); // Remove the file from the array
    this.imagePreviews.splice(index, 1); // Remove the preview from the array
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

    // If there are existing images, fetch them as binary (Blob) and append to FormData
    if (this.existingImagePaths.length > 0) {
      this.existingImagePaths.forEach((imagePath, index) => {
        this.roomService.getImage(imagePath).subscribe(
          (imageBlob: Blob) => {
            // Append the existing image to FormData as binary data (Blob)
            formData.append('images', imageBlob, `existingImage_${index}.jpg`);

            // Check if all images are appended before making the API call
            if (index === this.existingImagePaths.length - 1) {
              this.appendNewImagesAndSave(formData); // Append new images and submit
            }
          },
          (error) => {
            console.error('Error fetching existing image:', error);
          }
        );
      });
    } else {
      // If no existing images, directly append new images and make the API call
      this.appendNewImagesAndSave(formData);
    }
  }

  // Function to append new image files and make the API call
  private appendNewImagesAndSave(formData: FormData): void {
    // Append new image files to FormData
    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    // Log FormData for debugging
    formData.forEach((value, key) => {
      console.log(`FormData key: ${key}, value:`, value);
    });

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
