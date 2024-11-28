import { AfterViewInit, Component } from '@angular/core';

declare var google: any;

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  banners: string[] = [
    '../../assets/img/pp1.jpg',
    'https://via.placeholder.com/600x200.png?text=ads+2',
  ];
  contactInfo = {
    customerService: ['097', '012', '011'],
    email: '@gmail.com',
    workingHours: {
      weekdays: '7-11am, 1-5pm',
      weekends: '8-12am',
    },
    address: 'Khan Steong MeanChey, Phnom Penh',
    country: 'Cambodia',
  };
  stepsToPost = [
    {
      title: 'Nom kiny',
      imageUrl: '../../assets/img/1.jpg',
      telegramUsername: '@Kinynom', // Replace with actual username
      phoneNumber: '015692014',
    },
    {
      title: 'Horng',
      imageUrl: '../../assets/img/horng.jpg',
      telegramUsername: '@R_Horng', // User's Telegram username
      phoneNumber: '09393845',
    },
    // Add more steps as needed
  ];

  constructor() {}
  // ngAfterViewInit(): void {
  //   throw new Error('Method not implemented.');
  // }
}
