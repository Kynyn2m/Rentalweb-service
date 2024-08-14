import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { USER_TYPE } from '../setting/user/user';
import { NgForm } from '@angular/forms';
import { ProfileService } from './profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChangePasswordComponent } from '../authentication/change-password/change-password.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  banners: string[] = [
    '/assets/img/phnompenfooter.jpg',
    'https://via.placeholder.com/600x200.png?text=ads+2',
  ];
  user = {
    id: '12345',
    username: 'Kiny',
    gender: 'male',
    address: '123 Main St, Anytown, Phnom penh',
    phoneNumber: '123-456-7890',
    photo: '/assets/img/pp.jpg',
  };

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.photo = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    console.log('Profile saved', this.user);
    // Implement save functionality here
  }

  cancelEdit() {
    console.log('Edit cancelled');
    // Implement cancel functionality here
  }
}
