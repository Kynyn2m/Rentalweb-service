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
  styleUrls: ['./profile.component.css', './../styles/styed.profile-2.css'],
})
export class ProfileComponent implements OnInit {
  error = '';
  loading: boolean = false;
  profile: USER_TYPE = new USER_TYPE();
  durationInSeconds = 3;
  constructor(
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private profileService: ProfileService,
  ) { }

  ngOnInit(): void {
    this.getProfile();
  }

  getProfile() {
    this.loading = true;
    this.profileService.getProfile().subscribe((resp: { data: USER_TYPE }) => {
      this.profile = resp.data;
      if (
        this.profile.profilePic == 'null' ||
        this.profile.profilePic == null
      ) {
        this.loading = true;
      } else {
        this.loading = false;
      }
    });
  }

  selectFile(event: any) {
    if (event.target.files) {
      let reader = new FileReader()
      reader.readAsDataURL(event.target.files[0])
      reader.onload = (event: any) => {
      }
    }
  }

  filechange(event: Event) {
    const _files = (event.target as HTMLInputElement).files;
    if (_files == null) {
      return;
    }

    if (_files.length <= 0) {
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(_files[0]);
    reader.onload = () => {
      this.profile.profilePic = reader.result?.toString().split(',')[1];
    }
    this.loading = false;
  }

  onSubmit(f: NgForm) {
    if (!f.valid) {
      return;
    }
    const oldurl = this.profile.profilePic
    this.profileService.updateProfile(this.profile).subscribe(
      (data) => {
        this.profile.profilePic = oldurl
        this._snackBar.open("Success", "Close", {
          duration: this.durationInSeconds * 1000
        });
      },
      (error) => {
        this.error = error;
      }
    );
  }

  OpenChangePassword(): void {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed', result);
    });
  }
}
