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
    { id: 1, title: 'Step 1' },
    { id: 2, title: 'Step 2' },
    { id: 3, title: 'Step 3' },
    { id: 4, title: 'Step 4' },
    { id: 5, title: 'Step 5' },
    { id: 6, title: 'Step 6' },
  ];

  constructor() {}
  // ngAfterViewInit(): void {
  //   throw new Error('Method not implemented.');
  // }
}
