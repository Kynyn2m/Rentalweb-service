import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LandService } from './land.service';
import Swal from 'sweetalert2';
import { DistrictService } from 'src/app/address/district.service';
import { CommuneService } from 'src/app/address/commune.service';
import { VillageService } from 'src/app/address/village.service';
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
});

@Component({
  selector: 'app-add-post-land',
  templateUrl: './add-post-land.component.html',
  styleUrls: ['./add-post-land.component.css'],
})
export class AddPostLandComponent implements OnInit {
  addPostForm!: FormGroup;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  imageError: string = '';

  userLocation: { lat: number; lng: number } | null = null;
  userMarker: any;
  map: any;

  provinceId_c: number | null = 0; // To track the selected province
  provinces_c: any[] = []; // Array to store the list of provinces
  districtId_c: number | null = 0; // To track the selected district
  districts_c: any[] = []; // Array to store the list of districts
  communeId_c: number | null = 0; // To track the selected commune
  communes_c: any[] = [];
  villageId_c: number | null = 0; // To track the selected village
  villages_c: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private landService: LandService,
    private districtService: DistrictService,
    private cdr: ChangeDetectorRef,
    private communeService: CommuneService,
    private villageService: VillageService
  ) {}

  ngOnInit(): void {
    this.getUserLocation();
    this.addPostForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      price: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      linkMap: ['', Validators.required],
      landSize: ['', Validators.required],
      image: [null, Validators.required],
      provinceId_c: [null, Validators.required], // Province selection
      districtId_c: [null, Validators.required], // District selection
      communeId_c: [null, Validators.required], // Commune selection
      villageId_c: [null, Validators.required], // Village selection
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
  ngAfterViewInit(): void {
    this.initializeMap();
  }
  initializeMap(): void {
    this.map = L.map('map').setView([11.562108, 104.888535], 12); // Default center if no user location

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    // Listen for map clicks to add or move the pin
    this.map.on('click', (event: any) => {
      const { lat, lng } = event.latlng;
      this.addUserMarker(lat, lng);
    });
  }

  addUserMarker(lat: number, lng: number): void {
    // Remove existing marker if any
    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }

    // Add a new marker at the user's location
    this.userMarker = L.marker([lat, lng], {
      draggable: true,
      icon: defaultIcon,
    }).addTo(this.map);
    this.map.setView([lat, lng], 12); // Center map on the user location

    // Update linkMap form control with the user's location in Google Maps format
    const linkMap = `https://www.google.com/maps?q=${lat},${lng}`;
    this.addPostForm.patchValue({ linkMap });

    // Update linkMap if marker is dragged
    this.userMarker.on('dragend', (event: any) => {
      const position = event.target.getLatLng();
      const updatedLinkMap = `https://www.google.com/maps?q=${position.lat},${position.lng}`;
      this.addPostForm.patchValue({ linkMap: updatedLinkMap });
    });
  }

  setCoordinates(lat: number, lng: number): void {
    // Generate a Google Maps link with the selected latitude and longitude
    const linkMap = `https://www.google.com/maps?q=${lat},${lng}`;

    console.log('Picked Latitude:', lat);
    console.log('Picked Longitude:', lng);
    console.log('Generated LinkMap:', linkMap);

    // Update form fields with latitude, longitude, and linkMap
    this.addPostForm.patchValue({
      latitude: lat,
      longitude: lng,
      linkMap: linkMap, // Update linkMap with the generated link
    });
  }
  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log('User Location:', lat, lng);

          // Set up map with user location and place a pin
          this.addUserMarker(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Optionally, you can handle denied access or errors here
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
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
    console.log('Province Selected:', this.provinceId_c); // Log the selected province ID

    if (this.provinceId_c) {
      // Fetch districts when a province is selected
      this.districtService.getByProvincePublic(this.provinceId_c).subscribe(
        (res) => {
          console.log('Districts Response:', res); // Log the districts response
          if (res && res.result) {
            this.districts_c = res.result;
          } else {
            this.districts_c = [];
            console.error('No districts found for this province.');
          }
          this.cdr.detectChanges(); // Trigger change detection
        },
        (error) => {
          console.error('Error fetching districts:', error);
        }
      );
    }
  }
  onDistrictSelected(event: any): void {
    this.districtId_c = event.value;
    console.log('Selected District ID:', this.districtId_c); // Log the selected district ID

    if (this.districtId_c) {
      // Fetch communes when a district is selected
      this.communeService.getByDistrictPublic(this.districtId_c).subscribe(
        (res) => {
          console.log('Communes Response:', res); // Log the API response for communes
          if (res && res.result) {
            this.communes_c = res.result;
          } else {
            this.communes_c = [];
            console.error('No communes found for this district.');
          }
          this.cdr.detectChanges(); // Trigger change detection
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
    console.log('Selected Commune ID:', this.communeId_c); // Log the selected commune ID

    if (this.communeId_c) {
      // Fetch villages when a commune is selected
      this.villageService.getByCommunePublic(this.communeId_c).subscribe(
        (res) => {
          console.log('Villages Response:', res); // Log the API response for villages
          if (res && res.result) {
            this.villages_c = res.result;
          } else {
            this.villages_c = [];
            console.error('No villages found for this commune.');
          }
          this.cdr.detectChanges(); // Trigger change detection
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
        this.selectedFiles.push(file); // Store valid image files
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push(reader.result as string); // Store image preview
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
      formData.append(
        'description',
        this.addPostForm.get('description')?.value
      );
      formData.append('price', this.addPostForm.get('price')?.value);
      formData.append(
        'phoneNumber',
        this.addPostForm.get('phoneNumber')?.value
      );
      formData.append('linkMap', this.addPostForm.get('linkMap')?.value);
      formData.append('landSize', this.addPostForm.get('landSize')?.value);
      formData.append('provinceId', this.provinceId_c?.toString() || '');
      formData.append('districtId', this.districtId_c?.toString() || '');
      formData.append('communeId', this.communeId_c?.toString() || '');
      formData.append('villageId', this.villageId_c?.toString() || '');
      this.selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      this.landService.createPost(formData).subscribe(
        (response) => {
          Swal.fire({
            title: 'Success!',
            text: 'Your post has been successfully created.',
            icon: 'success',
            confirmButtonText: 'Go to Land Listings',
            cancelButtonText: 'Close',
            showCancelButton: true,
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/land']);
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
            showConfirmButton: false,
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
