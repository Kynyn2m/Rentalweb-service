import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // Import SafeUrl
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { ProvinceService } from 'src/app/address/province.service';
import { VillageService } from 'src/app/address/village.service';
import { HouseService } from 'src/app/Service/house.service';
import { ProfileService } from '../profile.service';

@Component({
  selector: 'app-update-house-dialog',
  templateUrl: './update-house-dialog.component.html',
  styleUrls: ['./update-house-dialog.component.css']
})
export class UpdateHouseDialogComponent implements OnInit {
  houseData: any; // The house data passed into the dialog
  provinces: any[] = [];
  districts: any[] = [];
  communes: any[] = [];
  villages: any[] = [];
  imagePreview: SafeUrl | null = null; // Change type to SafeUrl
  selectedFile: File | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private districtService: DistrictService,
    private profileService: ProfileService,
    private communeService: CommuneService,
    private villageService: VillageService,
    private provinceService: ProvinceService,
    private houseService: HouseService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UpdateHouseDialogComponent>,
    private sanitizer: DomSanitizer // Inject DomSanitizer
  ) {
    this.houseData = data.houseData || {};
  }

  ngOnInit(): void {
    console.log('House data:', this.houseData);

    // Fetch provinces when the dialog opens
    this.fetchProvinces();

    // Load existing house data and populate form fields if they exist
    if (this.houseData.province) {
      this.houseData.provinceId = this.houseData.province;  // Bind province to provinceId
      this.onProvinceSelected(this.houseData.provinceId);    // Ensure districts load as well
    }

    if (this.houseData.district) {
      // This will load communes based on the selected district
      this.onDistrictSelected(this.houseData.district);
    }

    if (this.houseData.commune) {
      // This will load villages based on the selected commune
      this.onCommuneSelected(this.houseData.commune);
    }

    // If there's an image, sanitize and display the first one as a preview
    if (this.houseData.imagePaths && this.houseData.imagePaths.length > 0) {
      this.loadImage(this.houseData, 'house'); // Use 'house' as the type
    }
  }

  fetchProvinces(): void {
    this.provinceService.getAllPublic().subscribe((res) => {
      this.provinces = res.result.result || [];

      if (this.houseData.provinceId) {
        console.log('Selected Province after fetching:', this.houseData.provinceId);  // Check if provinceId is correct
      }
    });
  }

  onProvinceSelected(provinceId: number): void {
    if (provinceId) {
      this.districtService.getByProvincePublic(provinceId).subscribe(
        (res) => {
          this.districts = res.result || [];

          // Pre-select district if it exists in houseData
          if (this.houseData.district) {
            this.houseData.districtId = this.houseData.district;  // Pre-select the district
            this.onDistrictSelected(this.houseData.districtId);    // Trigger commune loading
          }

          // Clear communes and villages when the province changes
          this.communes = [];
          this.villages = [];
          this.houseData.communeId = null;
          this.houseData.villageId = null;
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

          // Pre-select commune if it exists in houseData
          if (this.houseData.commune) {
            this.houseData.communeId = this.houseData.commune;  // Pre-select the commune
            this.onCommuneSelected(this.houseData.communeId);   // Trigger village loading
          }

          // Clear villages when the district changes
          this.villages = [];
          this.houseData.villageId = null;
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

          // Pre-select village if it exists in houseData
          if (this.houseData.village) {
            this.houseData.villageId = this.houseData.village;  // Pre-select the village
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
        this.houseService.getImage(imagePath).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            item.safeImagePaths.push(safeUrl);  // Push sanitized URLs to the array
          },
          (error) => {
            console.error(`Error loading ${type} image for item with ID: ${item.id || 'unknown'}`, error);
            item.safeImagePaths.push('/assets/img/default-placeholder.png');  // Add a placeholder if image loading fails
          }
        );
      });
    } else {
      item.safeImagePaths.push('/assets/img/default-placeholder.png');  // Add a placeholder if no image exists
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
    // Prepare the house data to be sent to the API
    const houseUpdateData: any = {
      title: this.houseData.title,
      description: this.houseData.description,
      price: this.houseData.price,
      phoneNumber: this.houseData.phoneNumber,
      linkMap: this.houseData.linkMap,
      floor: this.houseData.floor,
      width: this.houseData.width,
      height: this.houseData.height,
      provinceId: this.houseData.provinceId,
      districtId: this.houseData.districtId,
      communeId: this.houseData.communeId,
      villageId: this.houseData.villageId
    };

    // Create FormData to send to the API
    const formData = new FormData();
    for (const key in houseUpdateData) {
      if (houseUpdateData.hasOwnProperty(key)) {
        formData.append(key, houseUpdateData[key]);
      }
    }

    // If a file is selected, append it to the form data
    if (this.selectedFile) {
      formData.append('images', this.selectedFile);
      console.log('Appended image to FormData:', this.selectedFile); // Log the appended file
    }

    // Call the updateHouse method from the house service
    this.houseService.updateHouse(this.houseData.id, formData).subscribe(
      (response) => {
        console.log('House updated successfully', response);
        this.dialogRef.close({ success: true });
        this.snackBar.open('House updated successfully', 'Close', {
          duration: 3000,
        });
      },
      (error) => {
        console.error('Error updating house:', error);
        this.snackBar.open('Error updating house', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  cancel(): void {
    this.dialogRef.close({ success: false });
  }
}
