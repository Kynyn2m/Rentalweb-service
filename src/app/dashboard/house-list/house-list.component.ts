import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HouseService } from 'src/app/Service/house.service';

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
  selector: 'app-house-list',
  templateUrl: './house-list.component.html',
  styleUrls: ['./house-list.component.css']
})
export class HouseListComponent implements OnInit {
  displayedColumns: string[] = ['image', 'title', 'location', 'price', 'width', 'height', 'floor', 'likeCount', 'viewCount', 'createdAt'];
  houses: House[] = [];

  constructor(
    private houseService: HouseService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.fetchHouses();
  }

  fetchHouses(): void {
    this.houseService.getHouses().subscribe(response => {
      if (response.code === 200) {
        this.houses = response.result.result as House[];
        this.houses.forEach(house => this.loadImage(house)); // Load and sanitize images
      }
    }, error => {
      console.error('Error fetching house data', error);
    });
  }

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
}
