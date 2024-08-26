import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
})
export class DetailsComponent implements OnInit {
  property: any;

  rooms = [
    {
      id: 1,
      title: 'Room 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$100',
      images: ['../../assets/room/r1.jpg', '../../assets/room/r1.jpg'],
      currentImageIndex: 0,
      description:
        'A cozy room in the heart of the city, close to all amenities.',
      relatedPosts: [
        { image: '../../assets/related1.jpg', title: 'Nearby Restaurant' },
        { image: '../../assets/related2.jpg', title: 'Popular Park' },
        { image: '../../assets/related3.jpg', title: 'Shopping Mall' },
      ],
    },
    // Additional room data...
  ];

  houses = [
    {
      id: 1,
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      images: ['../../assets/house/h1.jpeg', '../../assets/house/h1.jpeg'],
      currentImageIndex: 0,
      description:
        'A spacious house with a large garden, perfect for families.',
      relatedPosts: [
        { image: '../../assets/related1.jpg', title: 'Local School' },
        { image: '../../assets/related2.jpg', title: 'Community Center' },
        { image: '../../assets/related3.jpg', title: 'Shopping Plaza' },
      ],
    },
    // Additional house data...
  ];

  lands = [
    {
      id: 1,
      title: 'Land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$300',
      images: ['../../assets/land/L1.jpg', '../../assets/land/L1.jpg'],
      currentImageIndex: 0,
      description: 'A large plot of land suitable for development.',
      relatedPosts: [
        { image: '../../assets/related1.jpg', title: 'Nearby River' },
        { image: '../../assets/related2.jpg', title: 'Hiking Trails' },
        { image: '../../assets/related3.jpg', title: 'Small Town Nearby' },
      ],
    },
    // Additional land data...
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const type = params['type'];

      if (type === 'room') {
        this.property = this.rooms[0];
      } else if (type === 'house') {
        this.property = this.houses[0];
      } else if (type === 'land') {
        this.property = this.lands[0];
      }
    });
  }

  nextImage(): void {
    if (this.property) {
      this.property.currentImageIndex =
        (this.property.currentImageIndex + 1) % this.property.images.length;
    }
  }

  prevImage(): void {
    if (this.property) {
      this.property.currentImageIndex =
        (this.property.currentImageIndex - 1 + this.property.images.length) %
        this.property.images.length;
    }
  }
  goBack(): void {
    this.router.navigate(['/home']);
  }
}
