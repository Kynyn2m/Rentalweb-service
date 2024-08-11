import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  rooms = [
    {
      title: 'Room 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$100',
      imageUrl: 'https://via.placeholder.com/300x200.png?text=Room+1',
    },
    {
      title: 'Room 2',
      location: 'Location 2',
      contact: '0987654321',
      price: '$200',
      imageUrl: 'https://via.placeholder.com/300x200.png?text=Room+2',
    },
    {
      title: 'Room 3',
      location: 'Location 3',
      contact: '1234567890',
      price: '$150',
      imageUrl: 'https://via.placeholder.com/300x200.png?text=Room+3',
    },
    {
      title: 'Room 4',
      location: 'Location 4',
      contact: '0987654321',
      price: '$180',
      imageUrl: 'https://via.placeholder.com/300x200.png?text=Room+4',
    },
  ];

  houses = [
    {
      title: 'House 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$500',
      imageUrl: 'https://via.placeholder.com/300x200.png?text=House+1',
    },
    {
      title: 'House 2',
      location: 'Location 2',
      contact: '0987654321',
      price: '$600',
      imageUrl: 'https://via.placeholder.com/300x200.png?text=House+2',
    },
    {
      title: 'House 3',
      location: 'Location 3',
      contact: '1234567890',
      price: '$550',
      imageUrl: 'https://via.placeholder.com/300x200.png?text=House+3',
    },
    {
      title: 'House 4',
      location: 'Location 4',
      contact: '0987654321',
      price: '$650',
      imageUrl: 'https://via.placeholder.com/300x200.png?text=House+4',
    },
  ];

  lands = [
    {
      title: 'Land 1',
      location: 'Location 1',
      contact: '1234567890',
      price: '$300',
      imageUrl: 'https://via.placeholder.com/300x200.png?text=Land+1',
    },
    {
      title: 'Land 2',
      location: 'Location 2',
      contact: '0987654321',
      price: '$400',
      imageUrl: 'https://via.placeholder.com/300x200.png?text=Land+2',
    },
    {
      title: 'Land 3',
      location: 'Location 3',
      contact: '1234567890',
      price: '$350',
      imageUrl: 'https://via.placeholder.com/300x200.png?text=Land+3',
    },
    {
      title: 'Land 4',
      location: 'Location 4',
      contact: '0987654321',
      price: '$450',
      imageUrl: 'https://via.placeholder.com/300x200.png?text=Land+4',
    },
  ];
}
