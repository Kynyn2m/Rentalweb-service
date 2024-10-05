import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HouseService } from '../Service/house.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit {
  house: any; // Store the house details
  houses: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private houseService: HouseService
  ) {}

  ngOnInit(): void {
    // Get the house id from the route params
    const houseId = this.route.snapshot.paramMap.get('id');

    if (houseId) {
      this.getHouseDetails(houseId);
    }
  }
  likeHouse(houseId: number): void {
    this.houseService.likeHouse(houseId).subscribe(() => {
      const house = this.houses.find(h => h.id === houseId);
      if (house) {
        house.likeCount += 1; // Increment the like count on the UI
      }
    });
  }
  loadImage(house: any): void {
    this.houseService.getImage(house.imagePath).subscribe(imageBlob => {
      const objectURL = URL.createObjectURL(imageBlob);
      house.safeImagePath = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    });
  }
  goBack(): void {
    window.history.back();
  }

  // Fetch house details based on the ID
  getHouseDetails(id: string): void {
    this.houseService.getHouseById(id).subscribe(
      (response) => {
        this.house = response.result; // Assuming the house data is in response.result
      },
      (error) => {
        console.error('Error fetching house details:', error);
      }
    );
  }
}
