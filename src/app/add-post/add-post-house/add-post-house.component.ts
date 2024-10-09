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
    private fb: FormBuilder,
    private router: Router,
    private houseService: HouseService,
    private districtService: DistrictService,
    private cdr: ChangeDetectorRef,
    private communeService: CommuneService,
    private villageService: VillageService,

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
      provinceId_c: [null, Validators.required],  // Province selection
      districtId_c: [null, Validators.required],  // District selection
      communeId_c: [null, Validators.required],   // Commune selection
      villageId_c: [null, Validators.required],   // Village selection
    });

    this.districtService.getProvincesPublic().subscribe(
      (res) => {
        this.provinces_c = res.result.result || [];
        this.cdr.detectChanges(); // Ensure change detection is triggered
      },
      (error) => {
        console.error('Error fetching provinces:', error);
      }
    );
  }

  onAddressSelectionComplete(): void {
    // Construct location string based on selected values
    const selectedLocation = `${this.villageId_c}, ${this.communeId_c}, ${this.districtId_c}, ${this.provinceId_c}`;
    this.addPostForm.patchValue({
      location: selectedLocation,
    });
  }

  onProvinceSelected(event: any): void {
    this.provinceId_c = event.value;
    console.log('Province Selected:', this.provinceId_c);  // Log the selected province ID

    if (this.provinceId_c) {
      // Fetch districts when a province is selected
      this.districtService.getByProvincePublic(this.provinceId_c).subscribe(
        (res) => {
          console.log('Districts Response:', res);  // Log the districts response
          if (res && res.result) {
            this.districts_c = res.result;
          } else {
            this.districts_c = [];
            console.error('No districts found for this province.');
          }
          this.cdr.detectChanges();  // Trigger change detection
        },
        (error) => {
          console.error('Error fetching districts:', error);
        }
      );
    }
  }
  onDistrictSelected(event: any): void {
    this.districtId_c = event.value;
    console.log('Selected District ID:', this.districtId_c);  // Log the selected district ID

    if (this.districtId_c) {
      // Fetch communes when a district is selected
      this.communeService.getByDistrictPublic(this.districtId_c).subscribe(
        (res) => {
          console.log('Communes Response:', res);  // Log the API response for communes
          if (res && res.result) {
            this.communes_c = res.result;
          } else {
            this.communes_c = [];
            console.error('No communes found for this district.');
          }
          this.cdr.detectChanges();  // Trigger change detection
        },
        (error) => {
          console.error('Error fetching communes:', error);
        }
      );
    }
  }

  // Method to handle commune selection
  onCommuneSelected(event: any): void {
    this.communeId_c = event.value;
    console.log('Selected Commune ID:', this.communeId_c);  // Log the selected commune ID

    if (this.communeId_c) {
      // Fetch villages when a commune is selected
      this.villageService.getByCommunePublic(this.communeId_c).subscribe(
        (res) => {
          console.log('Villages Response:', res);  // Log the API response for villages
          if (res && res.result) {
            this.villages_c = res.result;
          } else {
            this.villages_c = [];
            console.error('No villages found for this commune.');
          }
          this.cdr.detectChanges();  // Trigger change detection
        },
        (error) => {
          console.error('Error fetching villages:', error);
        }
      );
    }
  }

  // File selection and preview generation
  onFileSelected(event: any): void {
    const files: File[] = Array.from(event.target.files);

    // Clear previous selections
    this.selectedFiles = [];
    this.imagePreviews = [];

    files.forEach((file) => {
      if (file && file.type.startsWith('image/')) {
        this.selectedFiles.push(file);  // Store valid image files
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push(reader.result as string);  // Store image preview
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

  // Remove image preview
  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
    if (this.selectedFiles.length === 0) {
      this.addPostForm.get('image')?.setErrors({ required: true });
    }
  }

  onSubmit(): void {
    // Populate the location field based on selected address
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
          Swal.fire('Error', 'Failed to create post, please try again later.', 'error');
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
