import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { VillageService } from 'src/app/address/village.service';
import { HouseService } from 'src/app/Service/house.service';


export interface House {
  id: number;
  title: string;
  description: string;
  price: number;
  width: number;
  height: number;
  floor: number;
  imagePaths: string[];
  phoneNumber: string;
  safeImagePath?: SafeUrl;
  linkMap: string;
  createdAt: string;
  likeCount: number;
  viewCount: number;
  province: number;
  district: number;
  commune: number;
  village: number;
  type: string;
  likeable: boolean;
  favoriteable: boolean;
  user: {
    id: number;
    fullName: string;
    email: string;
    username: string;
  };
}


@Component({
  selector: 'app-view-house',
  templateUrl: './view-house.component.html',
  styleUrls: ['./view-house.component.css']
})
export class ViewHouseComponent implements OnInit {

  provinces: any[] = []; // Array of provinces with id and name
  districts: any[] = []; // Array of districts with id and name
  communes: any[] = [];  // Array of communes with id and name
  villages: any[] = [];  // Array of villages with id and name
  constructor(
    public dialogRef: MatDialogRef<ViewHouseComponent>,
    @Inject(MAT_DIALOG_DATA)
    public houseData: House,
    private cdr: ChangeDetectorRef,
    private districtService: DistrictService,
    private communeService: CommuneService,
    private villageService: VillageService,
    private houseService: HouseService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    // Load provinces
    this.loadProvinces();
  }

  loadImage(house: House): void {
    if (!house.imagePaths || house.imagePaths.length === 0) {
      console.error('No image paths available for house:', house);
      return;
    }

    const firstImagePath = house.imagePaths[0]; // Use the first image path or modify as needed

    this.houseService.getImage(firstImagePath).subscribe(
      (imageBlob) => {
        // Convert the image Blob to a URL
        const objectURL = URL.createObjectURL(imageBlob);
        // Sanitize the image URL before assigning it to the house
        house.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      (error) => {
        console.error('Error loading image:', error);
      }
    );
  }

  // Fetch provinces data from the API
  loadProvinces() {
    this.districtService.getProvincesPublic().subscribe(
      (res) => {
        this.provinces = res.result.result || []; // Store provinces in the `provinces` array
        this.cdr.detectChanges();

        // If a province is already selected in houseData, load districts
        if (this.houseData.province) {
          this.onProvinceSelected(this.houseData.province);
        }
      },
      (error) => {
        console.error('Error fetching provinces:', error);
      }
    );
  }


  // Load districts based on selected province
  onProvinceSelected(provinceId: number) {
    this.districtService.getByProvincePublic(provinceId).subscribe(
      (res) => {
        this.districts = res.result || [];  // Populate districts array
        this.communes = [];
        this.villages = [];
        this.cdr.detectChanges();

        // If district is already selected, load communes
        if (this.houseData.district) {
          this.onDistrictSelected(this.houseData.district);
        }
      },
      (error) => {
        console.error('Error fetching districts:', error);
      }
    );
  }

  // Load communes based on selected district
  onDistrictSelected(districtId: number) {
    this.communeService.getByDistrictPublic(districtId).subscribe(
      (res) => {
        this.communes = res.result || [];  // Populate communes array
        this.villages = [];
        this.cdr.detectChanges();

        // If commune is already selected, load villages
        if (this.houseData.commune) {
          this.onCommuneSelected(this.houseData.commune);
        }
      },
      (error) => {
        console.error('Error fetching communes:', error);
      }
    );
  }

  // Load villages based on selected commune
  onCommuneSelected(communeId: number) {
    this.villageService.getByCommunePublic(communeId).subscribe(
      (res) => {
        this.villages = res.result || [];  // Populate villages array
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching villages:', error);
      }
    );
  }

  // Helper functions to get names from ID
  getProvinceName(provinceId: number): string {
    const province = this.provinces.find(p => p.id === provinceId);
    return province ? province.khmerName || province.englishName : 'Unknown Province';
  }

  getDistrictName(districtId: number): string {
    const district = this.districts.find(d => d.id === districtId);
    return district ? district.khmerName || district.englishName : 'Unknown District';
  }

  getCommuneName(communeId: number): string {
    const commune = this.communes.find(c => c.id === communeId);
    return commune ? commune.khmerName || commune.englishName : 'Unknown Commune';
  }

  getVillageName(villageId: number): string {
    const village = this.villages.find(v => v.id === villageId);
    return village ? village.khmerName || village.englishName : 'Unknown Village';
  }

    closeDialog(): void {
      this.dialogRef.close();
    }
}
