import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LandService } from 'src/app/add-post/add-post-land/land.service';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { ProvinceService } from 'src/app/address/province.service';
import { VillageService } from 'src/app/address/village.service';

@Component({
  selector: 'app-update-land-dialog',
  templateUrl: './update-land-dialog.component.html',
  styleUrls: ['./update-land-dialog.component.css'],
})
export class UpdateLandDialogComponent {
  landData: any; // The land data passed into the dialog
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
    private landService: LandService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UpdateLandDialogComponent>,
    private sanitizer: DomSanitizer // Inject DomSanitizer
  ) {
    this.landData = data.landData || {};
  }

  ngOnInit(): void {
    console.log('Land data:', this.landData);

    // Fetch provinces when the dialog opens
    this.fetchProvinces();

    // Load existing land data and populate form fields if they exist
    if (this.landData.province) {
      this.landData.provinceId = this.landData.province; // Bind province to provinceId
      this.onProvinceSelected(this.landData.provinceId); // Ensure districts load as well
    }

    if (this.landData.district) {
      // This will load communes based on the selected district
      this.onDistrictSelected(this.landData.district);
    }

    if (this.landData.commune) {
      // This will load villages based on the selected commune
      this.onCommuneSelected(this.landData.commune);
    }

    // If there's an image, sanitize and display the first one as a preview
    if (this.landData.imagePaths && this.landData.imagePaths.length > 0) {
      this.loadImage(this.landData, 'land'); // Use 'land' as the type
    }
  }

  fetchProvinces(): void {
    this.provinceService.getAllPublic().subscribe((res) => {
      this.provinces = res.result.result || [];

      if (this.landData.provinceId) {
        console.log(
          'Selected Province after fetching:',
          this.landData.provinceId
        ); // Check if provinceId is correct
      }
    });
  }

  onProvinceSelected(provinceId: number): void {
    if (provinceId) {
      this.districtService.getByProvincePublic(provinceId).subscribe(
        (res) => {
          this.districts = res.result || [];

          // Pre-select district if it exists in landData
          if (this.landData.district) {
            this.landData.districtId = this.landData.district; // Pre-select the district
            this.onDistrictSelected(this.landData.districtId); // Trigger commune loading
          }

          // Clear communes and villages when the province changes
          this.communes = [];
          this.villages = [];
          this.landData.communeId = null;
          this.landData.villageId = null;
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

          // Pre-select commune if it exists in landData
          if (this.landData.commune) {
            this.landData.communeId = this.landData.commune; // Pre-select the commune
            this.onCommuneSelected(this.landData.communeId); // Trigger village loading
          }

          // Clear villages when the district changes
          this.villages = [];
          this.landData.villageId = null;
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

          // Pre-select village if it exists in landData
          if (this.landData.village) {
            this.landData.villageId = this.landData.village; // Pre-select the village
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
        this.landService.getImage(imagePath).subscribe(
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
    // Prepare the land data to be sent to the API
    const landUpdateData: any = {
      title: this.landData.title,
      description: this.landData.description,
      price: this.landData.price,
      phoneNumber: this.landData.phoneNumber,
      linkMap: this.landData.linkMap,
      landSize: this.landData.landSize,
      provinceId: this.landData.provinceId,
      districtId: this.landData.districtId,
      communeId: this.landData.communeId,
      villageId: this.landData.villageId,
    };

    // Create FormData to send to the API
    const formData = new FormData();
    for (const key in landUpdateData) {
      if (landUpdateData.hasOwnProperty(key)) {
        formData.append(key, landUpdateData[key]);
      }
    }

    // If a file is selected, append it to the form data
    if (this.selectedFile) {
      formData.append('images', this.selectedFile);
      console.log('Appended image to FormData:', this.selectedFile); // Log the appended file
    }

    // Call the updateLand method from the land service
    this.landService.updateLand(this.landData.id, formData).subscribe(
      (response) => {
        console.log('Land updated successfully', response);
        this.dialogRef.close({ success: true });
        this.snackBar.open('Land updated successfully', 'Close', {
          duration: 3000,
        });
      },
      (error) => {
        console.error('Error updating land:', error);
        this.snackBar.open('Error updating land', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  cancel(): void {
    this.dialogRef.close({ success: false });
  }
}
