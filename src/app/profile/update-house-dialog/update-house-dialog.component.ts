import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DomSanitizer } from '@angular/platform-browser';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { ProvinceService } from 'src/app/address/province.service';
import { VillageService } from 'src/app/address/village.service';
import { HouseService } from 'src/app/Service/house.service';

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
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private districtService: DistrictService,
    private communeService: CommuneService,
    private villageService: VillageService,
    private provinceService: ProvinceService,
    private houseService: HouseService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UpdateHouseDialogComponent>,
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

    // If there's an image, display the first one as a preview
    if (this.houseData.imagePaths && this.houseData.imagePaths.length > 0) {
      this.imagePreview = this.houseData.imagePaths[0];
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


  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Handle file preview and upload logic
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  save(): void {
    // Prepare the house data to be sent to the API
    const houseUpdateData: any = {
      title: this.houseData.title,
      description: this.houseData.description,
      price: this.houseData.price,
      landSize: this.houseData.landSize,
      phoneNumber: this.houseData.phoneNumber,
      linkMap: this.houseData.linkMap,
      floor: this.houseData.floor,
      width: this.houseData.width,
      height: this.houseData.height,
    };

    // Ensure all required fields are filled before making the API request
    if (!this.houseData.provinceId || !this.houseData.districtId || !this.houseData.communeId || !this.houseData.villageId) {
      console.error('Error: Missing required fields');
      return; // Don't proceed if any required field is missing
    }

    // Include province, district, commune, and village IDs
    houseUpdateData.provinceId = this.houseData.provinceId;
    houseUpdateData.districtId = this.houseData.districtId;
    houseUpdateData.communeId = this.houseData.communeId;
    houseUpdateData.villageId = this.houseData.villageId;

    // If a file is selected, append it to the form data
    const formData = new FormData();
    for (const key in houseUpdateData) {
      if (houseUpdateData.hasOwnProperty(key)) {
        formData.append(key, houseUpdateData[key]);
      }
    }

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // Call the updateHouse method from the house service
    this.houseService.updateHouse(this.houseData.id, formData).subscribe(
      (response) => {
      console.log('House updated successfully', response);
      this.dialogRef.close({ success: true }); // Close the dialog and return success
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
