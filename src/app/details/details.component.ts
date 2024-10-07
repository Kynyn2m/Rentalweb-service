import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HouseService } from '../Service/house.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';

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
  imagePath: string;
  safeImagePath?: SafeUrl; // Safe image URL after sanitization
  likeCount: number;
  linkMap: string;
  viewCount: number;
  createdAt: string;
}

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit {
  house: House | null = null; // Use proper type for house

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private houseService: HouseService
  ) {}

  ngOnInit(): void {
    const houseId = this.route.snapshot.paramMap.get('id');
    if (houseId) {
      this.getHouseDetails(houseId);
    }
  }

  // Fetch house details based on the ID
  getHouseDetails(id: string): void {
    this.houseService.getHouseById(id).subscribe(
      (response) => {
        this.house = response.result as House; // Map API result to house object
        if (this.house) {
          this.loadImage(this.house); // Load and sanitize the image
        }
      },
      (error) => {
        console.error('Error fetching house details:', error);
      }
    );
  }

  // Load and sanitize the house image
  loadImage(house: House): void {
    this.houseService.getImage(house.imagePath).subscribe(
      (imageBlob) => {
        const objectURL = URL.createObjectURL(imageBlob);
        house.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      (error) => {
        console.error('Error loading image:', error);
      }
    );
  }

  // Handle like functionality
  likeHouse(houseId: number): void {
    if (!this.house) return;

    this.houseService.likeHouse(houseId).subscribe(() => {
      this.house!.likeCount += 1; // Update like count for the current house
    });
  }

  goBack(): void {
    window.history.back();
  }
}
