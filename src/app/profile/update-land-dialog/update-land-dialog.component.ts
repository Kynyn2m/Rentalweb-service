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
  landData: any;
  provinces: any[] = [];
  districts: any[] = [];
  communes: any[] = [];
  villages: any[] = [];
  imagePreview: SafeUrl | null = null;
  selectedFile: File | null = null;
  selectedFiles: File[] = [];
  imagePreviews: SafeUrl[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private districtService: DistrictService,
    private communeService: CommuneService,
    private villageService: VillageService,
    private provinceService: ProvinceService,
    private landService: LandService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UpdateLandDialogComponent>,
    private sanitizer: DomSanitizer
  ) {
    this.landData = data.landData || {};
  }

  ngOnInit(): void {
    console.log('Land data:', this.landData);

    this.fetchProvinces();

    if (this.landData.province) {
      this.landData.provinceId = this.landData.province;
      this.onProvinceSelected(this.landData.provinceId);
    }

    if (this.landData.district) {
      this.onDistrictSelected(this.landData.district);
    }

    if (this.landData.commune) {
      this.onCommuneSelected(this.landData.commune);
    }

    if (this.landData.imagePaths && this.landData.imagePaths.length > 0) {
      this.loadImages(this.landData.imagePaths);
    }
  }

  fetchProvinces(): void {
    this.provinceService.getAllPublic().subscribe((res) => {
      this.provinces = res.result.result || [];

      if (this.landData.provinceId) {
        console.log(
          'Selected Province after fetching:',
          this.landData.provinceId
        );
      }
    });
  }

  onProvinceSelected(provinceId: number): void {
    if (provinceId) {
      this.districtService.getByProvincePublic(provinceId).subscribe(
        (res) => {
          this.districts = res.result || [];

          if (this.landData.district) {
            this.landData.districtId = this.landData.district;
            this.onDistrictSelected(this.landData.districtId);
          }

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

          if (this.landData.commune) {
            this.landData.communeId = this.landData.commune;
            this.onCommuneSelected(this.landData.communeId);
          }

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

          if (this.landData.village) {
            this.landData.villageId = this.landData.village;
          }
        },
        (error) => {
          console.error('Error fetching villages:', error);
        }
      );
    }
  }

  loadImages(imagePaths: string[]): void {
    this.imagePreviews = [];
    imagePaths.forEach((imagePath) => {
      this.landService.getImage(imagePath).subscribe(
        (imageBlob) => {
          const objectURL = URL.createObjectURL(imageBlob);
          const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.imagePreviews.push(safeUrl);
        },
        (error) => {
          console.error('Error loading image:', error);
          this.imagePreviews.push(
            this.sanitizer.bypassSecurityTrustUrl(
              '/assets/img/default-placeholder.png'
            )
          );
        }
      );
    });
  }

  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        this.selectedFiles.push(file as File);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const previewUrl = this.sanitizer.bypassSecurityTrustUrl(
            e.target.result
          );
          this.imagePreviews.push(previewUrl);
        };
        reader.readAsDataURL(file as File);
      });
    }
  }

  cancelImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  save(): void {
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

    const formData = new FormData();
    for (const key in landUpdateData) {
      if (landUpdateData.hasOwnProperty(key)) {
        formData.append(key, landUpdateData[key]);
      }
    }

    for (const file of this.selectedFiles) {
      formData.append('images', file);
    }

    this.landService.updateLand(this.landData.id, formData).subscribe(
      (response) => {
        console.log('Land updated successfully', response);
        this.dialogRef.close({ success: true });
        this.snackBar.open('Land updated successfully', 'Close', {
          duration: 3000,
        });
      },
      (error) => {
        console.error('Error updating Land:', error);
        this.snackBar.open('Error updating Land', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  cancel(): void {
    this.dialogRef.close({ success: false });
  }
}
