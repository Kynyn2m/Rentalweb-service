 import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HouseService } from '../Service/house.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from './image-dialog.component';
import { DistrictService } from '../address/district.service';
import { CommuneService } from '../address/commune.service';
import { VillageService } from '../address/village.service';

import Swal from 'sweetalert2';
import { AuthenticationService } from '../authentication/authentication.service';
import * as L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});



/** Interfaces */
interface House {
  id: number;
  title: string;
  description: string;
  location: string;
  price: number;
  width: number;
  height: number;
  floor: number;
  phoneNumber: string;
  imagePaths: string[];
  safeImagePaths?: SafeUrl[];
  likeCount: number;
  linkMap: string;
  viewCount: number;
  createdAt: string;
  province: number;
  district: number;
  commune: number;
  village: number;
  liked: boolean;
  pending?: boolean;
  user: User;
}

interface User {
  id: number;
  fullName: string;
  gender: string;
  email: string;
  username: string;
  postCount: number;
  image: string;
  createdAt: string;
}

interface UserComment {
  id: number;
  userId: number;
  name: string;
  description: string;
  imagePath: string;
  replies: UserReply[];
  totalReply: number;
}

interface UserReply {
  id: number;
  userId: number;
  name: string;
  description: string;
  imagePath: string;
  replies: UserReply[];
  totalReply: number;
}



interface Location {
  id: number;
  englishName: string;
  khmerName: string;
}

interface PaggingModel<T> {
  totalPage: number;
  totalElements: number;
  currentPage: number;
  result: T[];
}


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit , AfterViewInit {
  house: House | null = null;
  selectedImage: SafeUrl | null = null;
  provinceName: string = '';
  districtName: string = '';
  communeName: string = '';
  villageName: string = '';
  currentImage: SafeUrl | null = null;
  urlSafe!: SafeResourceUrl;
  linkMap: string | null = null;
  comments: UserComment[] = [];
  replyText: { [key: number]: string } = {};
  newCommentText: string = '';
  activeMenu: number | null = null;

  map: L.Map | null = null
  userMarker: any;
  markers: L.Marker[] = [];
  isMapInitialized: boolean = false;


bankCount: number = 0;
gymCount: number = 0;
restaurantCount: number = 0;
hotelCount: number = 0;
barPubCount: number = 0;
cafeCount: number = 0;
hospitalCount: number = 0;
supermarketCount: number = 0;


  isLoading: boolean = false;








  constructor(
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer,
    private readonly houseService: HouseService,
    private readonly dialog: MatDialog,
    private readonly districtService: DistrictService,
    private readonly communeService: CommuneService,
    private readonly villageService: VillageService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,

  ) {
    this.setDefaultMapUrl();

  }


  ngOnInit(): void {
    const houseIdParam = this.route.snapshot.paramMap.get('id');
    const houseId = houseIdParam ? parseInt(houseIdParam, 10) : null;

    if (houseId) {
      this.getHouseDetails(houseId);
      this.loadComments(houseId);
    } else {
      console.error('Invalid house ID');
    }
  }

  loadComments(houseId: number): void {

    this.houseService.getComments(houseId).subscribe(
      (response) => {
        if (response.code === 200) {
          this.comments = response.result.result as UserComment[];
        }

      },
      (error) => {
        console.error('Error loading comments:', error);

      }
    );
  }

  postComment(): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to post a comment.',
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }
    if (!this.newCommentText.trim()) return;

    const houseId = this.house?.id ?? 34;
    const type = 'house';
    const description = this.newCommentText;


    this.houseService.postComment(houseId, description, type).subscribe(
      (response) => {
        if (response) {
          this.loadComments(houseId); // Reload comments to fetch latest data
          this.newCommentText = ''; // Clear input field
        }

      },
      (error) => {
        console.error('Error posting comment:', error);

      }
    );
  }

  sendReply(commentId: number): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to reply to this comment.',
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    const description = this.replyText[commentId];
    if (!description) return;


    this.houseService.replyToComment(commentId, description).subscribe(
      (response) => {
        if (response) {
          const houseId = this.house?.id ?? 34;
          this.loadComments(houseId); // Reload comments to fetch latest data
          this.replyText[commentId] = ''; // Clear reply input
        }

      },
      (error) => {
        console.error('Error posting reply:', error);

      }
    );
  }
  toggleMenu(commentId: number): void {
    this.activeMenu = this.activeMenu === commentId ? null : commentId;
  }

  deleteComment(commentId: number): void {
    if (!this.authenticationService.isLoggedIn()) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Logged In',
        text: 'Please log in to delete a comment.',
        confirmButtonText: 'Login',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return; // Exit if the user is not logged in
    }

    this.houseService.deleteComment(commentId).subscribe(
      () => {
        const houseId = this.house?.id ?? 34;
        this.loadComments(houseId); // Reload comments to update the list
        this.activeMenu = null;

      },
      (error) => {
        console.error('Error deleting comment:', error);

      }
    );
  }

  ngAfterViewInit(): void {
    if (this.house && this.house.linkMap) {
      const coordinates = this.extractCoordinates(this.house.linkMap);
      if (coordinates) {
        this.initializeMap(coordinates.lat, coordinates.lng);
      }
    }
  }


  getHouseDetails(id: number): void {
    this.houseService.getHouseById(id.toString()).subscribe(
      (response) => {
        this.house = response.result as House;
        if (this.house) {
          this.loadImages(this.house);
          this.fetchLocationDetails(this.house.province, this.house.district, this.house.commune, this.house.village);

          if (this.house.linkMap) {
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(
              `${this.house.linkMap}&output=embed`
            );

            const coordinates = this.extractCoordinates(this.house.linkMap);
            if (coordinates) {
              this.initializeMap(coordinates.lat, coordinates.lng);
              this.fetchAndDisplayNearbyLocations(coordinates.lat, coordinates.lng);
            }
          }
        }
      },
      (error) => {
        console.error('Error fetching house details:', error);
      }
    );
  }




  setDefaultMapUrl(): void {
    // Set the default map to Phnom Penh coordinates if no specific link is available
    const url = `https://maps.google.com/maps?q=11.5564,104.9282&z=14&output=embed`;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  setMapUrl(): void {
    // Set the URL to display Phnom Penh, Cambodia, on the map
    const url = `https://maps.google.com/maps?q=11.5564,104.9282&z=14&output=embed`;
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  extractCoordinates(linkMap: string): { lat: number; lng: number } | null {
    const match = linkMap.match(/q=([-.\d]+),([-.\d]+)/);
    return match ? { lat: parseFloat(match[1]), lng: parseFloat(match[2]) } : null;
  }

  initializeMap(lat: number, lng: number): void {
    if (!this.map) {
      setTimeout(() => {
        const mapContainer = document.getElementById('house-map');
        if (!mapContainer) {
          console.error('Map container not found.');
          return;
        }

        // Initialize the map centered on the property
        this.map = L.map('house-map').setView([lat, lng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(this.map);

        // Place a marker at the property location
        L.marker([lat, lng]).addTo(this.map).bindPopup('Property Location').openPopup();

        // Fetch and display nearby locations
        this.fetchAndDisplayNearbyLocations(lat, lng);
      }, 0);
    }
  }

fetchAndDisplayNearbyLocations(lat: number, lng: number): void {
    const amenities = ['bank', 'gym', 'restaurant', 'hotel', 'bar', 'pub', 'cafe', 'hospital', 'supermarket'];

    amenities.forEach((amenity) => {
      const query = `
        [out:json];
        node(around:1000, ${lat}, ${lng})["amenity"="${amenity}"];
        out;
      `;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

      console.log(`Fetching nearby ${amenity} with URL:`, url);

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log(`Raw data for nearby ${amenity}:`, data);

          if (data.elements && data.elements.length > 0) {
            this.displayNearbyPlaces(data.elements, amenity);

            // Update counters for each amenity type
            switch (amenity) {
              case 'bank':
                this.bankCount = data.elements.length;
                break;
              case 'gym':
                this.gymCount = data.elements.length;
                break;
              case 'restaurant':
                this.restaurantCount = data.elements.length;
                break;
              case 'hotel':
                this.hotelCount = data.elements.length;
                break;
              case 'bar':
              case 'pub':
                this.barPubCount = (this.barPubCount || 0) + data.elements.length;
                break;
              case 'cafe':
                this.cafeCount = data.elements.length;
                break;
              case 'hospital':
                this.hospitalCount = data.elements.length;
                break;
              case 'supermarket':
                this.supermarketCount = data.elements.length;
                break;
            }
          } else {
            console.log(`No ${amenity} found within the specified radius.`);
          }
        })
        .catch((error) => {
          console.error(`Error fetching nearby ${amenity} locations:`, error);
        });
    });
}

displayNearbyPlaces(places: any[], amenity: string): void {
    if (!this.map) {
      console.error('Map is not initialized.');
      return;
    }

    console.log(`Displaying ${places.length} nearby ${amenity} places on the map.`);
    places.forEach((place) => {
      if (place.lat && place.lon) {
        const marker = L.marker([place.lat, place.lon]).addTo(this.map as L.Map);
        marker.bindPopup(`<b>${place.tags.name || 'Unnamed'}</b><br>Type: ${amenity}`);
        this.markers.push(marker);
      } else {
        console.log(`Skipping place without coordinates:`, place);
      }
    });
}



  loadImages(house: House): void {
    if (house.imagePaths && house.imagePaths.length > 0) {
      house.safeImagePaths = [];
      house.imagePaths.forEach((imagePath) => {
        this.houseService.getImage(imagePath).subscribe(
          (imageBlob) => {
            const objectURL = URL.createObjectURL(imageBlob);
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            house.safeImagePaths!.push(safeUrl);
            if (!this.currentImage) {
              this.currentImage = safeUrl;
            }
          },
          (error) => {
            console.error('Error loading image:', error);
          }
        );
      });
    }
  }

  fetchLocationDetails(provinceId: number, districtId: number, communeId: number, villageId: number): void {
    this.districtService.getProvincesPublic().subscribe((res) => {
      const paginatedResponse = res as PaggingModel<Location>;
      const provinceIdNumber = Number(provinceId); // Convert provinceId to a number

      const province = Array.isArray(paginatedResponse.result) ?
        paginatedResponse.result.find((p) => p.id === provinceIdNumber) : null; // Compare as numbers
      // console.log("res", res);



      // console.log('Province ID:', provinceIdNumber); // Log the ID
      // console.log('Provinces array:', paginatedResponse.result); // Log the provinces array
      // console.log('Found province:', province); // Log the found province
      // console.log('Province Khmer Name:', province ? province.khmerName : 'Not Found'); // Log the Khmer name

      console.log('province response:', province);


      this.provinceName = province ? (province.khmerName || province.englishName) : 'Unknown Province';
      this.cdr.detectChanges();
    });

    this.districtService.getByProvincePublic(provinceId).subscribe((res) => {
      console.log('Districts response:', res);
      const paginatedResponse = res as PaggingModel<Location>;
      const district = Array.isArray(paginatedResponse.result) ? paginatedResponse.result.find((d) => d.id === districtId) : null;
      this.districtName = district ? district.khmerName || district.englishName : 'Unknown District';
      this.cdr.detectChanges();
    });

    this.communeService.getByDistrictPublic(districtId).subscribe((res) => {
      console.log('Communes response:', res);
      const paginatedResponse = res as PaggingModel<Location>;
      const commune = Array.isArray(paginatedResponse.result) ? paginatedResponse.result.find((c) => c.id === communeId) : null;
      this.communeName = commune ? commune.khmerName || commune.englishName : 'Unknown Commune';
      this.cdr.detectChanges();
    });

    this.villageService.getByCommunePublic(communeId).subscribe((res) => {
      console.log('Villages response:', res);
      const paginatedResponse = res as PaggingModel<Location>;
      const village = Array.isArray(paginatedResponse.result) ? paginatedResponse.result.find((v) => v.id === villageId) : null;
      this.villageName = village ? village.khmerName || village.englishName : 'Unknown Village';
      this.cdr.detectChanges();
    });
  }





  openImageInFullScreen(image: SafeUrl): void {
    this.dialog.open(ImageDialogComponent, {
      data: { image },
      panelClass: 'full-screen-modal',
    });
  }
  previousImage(): void {
    if (this.house && this.house.safeImagePaths) {
      const index = this.house.safeImagePaths.indexOf(this.currentImage!);
      if (index > 0) {
        this.currentImage = this.house.safeImagePaths[index - 1];
      }
    }
  }

  nextImage(): void {
    if (this.house && this.house.safeImagePaths) {
      const index = this.house.safeImagePaths.indexOf(this.currentImage!);
      if (index < this.house.safeImagePaths.length - 1) {
        this.currentImage = this.house.safeImagePaths[index + 1];
      }
    }
  }
  selectImage(image: SafeUrl): void {
    this.currentImage = image;
  }

  goBack(): void {
    window.history.back();
  }
}
