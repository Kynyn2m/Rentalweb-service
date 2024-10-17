import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommuneService } from 'src/app/address/commune.service';
import { DistrictService } from 'src/app/address/district.service';
import { VillageService } from 'src/app/address/village.service';
import { HouseService } from 'src/app/Service/house.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-post-house',
  templateUrl: './add-post-house.component.html',
  styleUrls: ['./add-post-house.component.css']
})
export class AddPostHouseComponent implements OnInit {
  addPostForm!: FormGroup;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  imageError: string = '';

  provinceId_c: number | null = 0; // To track the selected province
  provinces_c: any[] = []; // Array to store the list of provinces
  districtId_c: number | null = 0; // To track the selected district
  districts_c: any[] = []; // Array to store the list of districts
  communeId_c: number | null = 0;   // To track the selected commune
  communes_c: any[] = [];
  villageId_c: number | null = 0;   // To track the selected village
  villages_c: any[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly houseService: HouseService,
    private readonly districtService: DistrictService,
    private readonly cdr: ChangeDetectorRef,
    private readonly communeService: CommuneService,
    private readonly villageService: VillageService,

  ) {}

  ngOnInit(): void {
    this.addPostForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      price: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      linkMap: ['', Validators.required],
      floor: ['', Validators.required],
      width: ['', Validators.required],
      height: ['', Validators.required],
      image: [null, Validators.required],
      provinceId_c: [null, Validators.required],
      districtId_c: [null, Validators.required],
      communeId_c: [null, Validators.required],
      villageId_c: [null, Validators.required],
    });

    this.districtService.getProvincesPublic().subscribe(
      (res) => {
        this.provinces_c = res.result.result || [];
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching provinces:', error);
      }
    );
  }

  onAddressSelectionComplete(): void {
    const selectedLocation = `${this.villageId_c}, ${this.communeId_c}, ${this.districtId_c}, ${this.provinceId_c}`;
    this.addPostForm.patchValue({
      location: selectedLocation,
    });
  }

  onProvinceSelected(event: any): void {
    this.provinceId_c = event.value;
    console.log('Province Selected:', this.provinceId_c);

    if (this.provinceId_c) {
      this.districtService.getByProvincePublic(this.provinceId_c).subscribe(
        (res) => {
          console.log('Districts Response:', res);
          if (res && res.result) {
            this.districts_c = res.result;
          } else {
            this.districts_c = [];
            console.error('No districts found for this province.');
          }
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching districts:', error);
        }
      );
    }
  }
  onDistrictSelected(event: any): void {
    this.districtId_c = event.value;
    console.log('Selected District ID:', this.districtId_c);

    if (this.districtId_c) {

      this.communeService.getByDistrictPublic(this.districtId_c).subscribe(
        (res) => {
          console.log('Communes Response:', res);
          if (res && res.result) {
            this.communes_c = res.result;
          } else {
            this.communes_c = [];
            console.error('No communes found for this district.');
          }
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching communes:', error);
        }
      );
    }
  }


  onCommuneSelected(event: any): void {
    this.communeId_c = event.value;
    console.log('Selected Commune ID:', this.communeId_c);
    if (this.communeId_c) {
      this.villageService.getByCommunePublic(this.communeId_c).subscribe(
        (res) => {
          console.log('Villages Response:', res);
          if (res && res.result) {
            this.villages_c = res.result;
          } else {
            this.villages_c = [];
            console.error('No villages found for this commune.');
          }
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching villages:', error);
        }
      );
    }
  }

  onVillageSelected(event: any): void {
    this.villageId_c = event.value;
    console.log('Selected Village ID:', this.villageId_c);
  }



  onFileSelected(event: any): void {
    const files: File[] = Array.from(event.target.files);

    this.selectedFiles = [];
    this.imagePreviews = [];

    files.forEach((file) => {
      if (file && file.type.startsWith('image/')) {
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        this.imageError = 'Please upload valid image files';
      }
    });

    if (this.selectedFiles.length === 0) {
      this.imageError = 'No valid image files selected';
      this.addPostForm.get('image')?.setErrors({ required: true });
    } else {
      this.imageError = '';
      this.addPostForm.get('image')?.setValue(this.selectedFiles);
      this.addPostForm.get('image')?.updateValueAndValidity();
    }
  }

  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
    if (this.selectedFiles.length === 0) {
      this.addPostForm.get('image')?.setErrors({ required: true });
    }
  }

  onSubmit(): void {
    this.onAddressSelectionComplete();

    if (this.addPostForm.valid) {
      const formData = new FormData();
      formData.append('title', this.addPostForm.get('title')?.value);
      formData.append('description', this.addPostForm.get('description')?.value);
      formData.append('price', this.addPostForm.get('price')?.value);
      formData.append('phoneNumber', this.addPostForm.get('phoneNumber')?.value);
      formData.append('linkMap', this.addPostForm.get('linkMap')?.value);
      formData.append('floor', this.addPostForm.get('floor')?.value);
      formData.append('width', this.addPostForm.get('width')?.value);
      formData.append('height', this.addPostForm.get('height')?.value);
      formData.append('provinceId', this.provinceId_c?.toString() || '');
      formData.append('districtId', this.districtId_c?.toString() || '');
      formData.append('communeId', this.communeId_c?.toString() || '');
      formData.append('villageId', this.villageId_c?.toString() || '');
      this.selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      this.houseService.createPost(formData).subscribe(
        (response) => {
          Swal.fire({
            title: 'Success!',
            text: 'Your post has been successfully created.',
            icon: 'success',
            confirmButtonText: 'Go to House Listings',
            cancelButtonText: 'Close',
            showCancelButton: true,
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/house']);
            }
          });
        },
        (error) => {
          console.error('Error creating post:', error);
          Swal.fire({
            title: 'Error',
            html: `
              <p>អ្នកបានអស់ការផុសហើយសូមទំនាក់ទំនងទៅកាន់ admin</p>
              <a href="https://t.me/Kinynom" target="_blank" style="display: inline-block; padding: 10px 20px; margin-top: 10px; background-color: #3085d6; color: white; text-decoration: none; border-radius: 5px;">Contact Admin via Telegram</a>
            `,
            icon: 'error',
            showConfirmButton: false
          });
        }
      );
    } else {
      console.log('Form is invalid, please check inputs.');
    }
  }





  // Navigate back to the previous route
  goBack(): void {
    this.router.navigate(['/add-post']);
  }
}
