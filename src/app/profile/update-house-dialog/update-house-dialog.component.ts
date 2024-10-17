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
  selectedFiles: File[] = [];  // Array to hold multiple selected files
  imagePreviews: SafeUrl[] = []; // Array for image previews

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
      this.loadImages(this.houseData.imagePaths); // Load and sanitize image paths
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

  loadImages(imagePaths: string[]): void {
    this.imagePreviews = []; // Clear existing previews
    imagePaths.forEach((imagePath) => {
      this.houseService.getImage(imagePath).subscribe(
        (imageBlob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.imagePreviews.push(safeUrl);  // Push sanitized URLs to the array
        },
        (error) => {
          console.error('Error loading image:', error);
          this.imagePreviews.push(this.sanitizer.bypassSecurityTrustUrl('/assets/img/default-placeholder.png'));  // Add a placeholder if image loading fails
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
          const previewUrl = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
          this.imagePreviews.push(previewUrl); // Add preview to the imagePreviews array
        };
        reader.readAsDataURL(file as File);
      });
    }
  }

  // Cancel (remove) image preview and selected file
  cancelImage(index: number): void {
    this.selectedFiles.splice(index, 1);  // Remove the file from the array
    this.imagePreviews.splice(index, 1);  // Remove the preview from the array
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

    // If files are selected, append them to the form data
    for (const file of this.selectedFiles) {
      formData.append('images', file);  // Append each selected file
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
