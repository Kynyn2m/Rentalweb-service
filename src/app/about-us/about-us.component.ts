import { Component } from '@angular/core';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css'],
})
export class AboutUsComponent {
  teamMembers = [
    {
      name: 'No name',
      position: 'CEO',
      photoUrl: 'assets/images/team/john.jpg',
    },
    {
      name: 'No name',
      position: 'COO',
      photoUrl: 'assets/images/team/jane.jpg',
    },
    {
      name: 'No name',
      position: 'CTO',
      photoUrl: 'assets/images/team/mark.jpg',
    },
  ];
}
