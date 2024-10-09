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

  // stepsToPost = [
  //   {
  //     title: 'admin',
  //     imageUrl: '../../assets/img/user.png',
  //     telegramUsername: 'username2',
  //   },
  //   {
  //     title: 'admin',
  //     imageUrl: '../../assets/img/user.png',
  //     telegramUsername: 'username2',
  //   },
  //   {
  //     title: 'admin',
  //     imageUrl: '../../assets/img/user.png',
  //     telegramUsername: 'username2',
  //   },
  //   {
  //     title: 'Horng',
  //     imageUrl: '../../assets/img/Screenshot 2022-11-23 205734.png',
  //     telegramUsername: 'username2',
  //   },
  //   // Add more steps as needed
  // ];
  stepsToPost = [
    {
      title: 'Admin 1',
      imageUrl: '../../assets/img/user.png',
      telegramUsername: '@Kinynom', // Replace with actual username
      phoneNumber: '06478934',
    },
    {
      title: 'Admin 2',
      imageUrl: '../../assets/img/user.png',
      telegramUsername: '@username2', // Replace with actual username
      phoneNumber: '047484833',
    },
    {
      title: 'Admin 3',
      imageUrl: '../../assets/img/user.png',
      telegramUsername: '@username3', // Replace with actual username
      phoneNumber: '0252666',
    },
    {
      title: 'Horng',
      imageUrl: '../../assets/img/Screenshot 2022-11-23 205734.png',
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
