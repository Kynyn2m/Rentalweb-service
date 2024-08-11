import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MENU_SETTING } from './setting';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent {
  // constructor(public dialog: MatDialog) {}

  // openChangePasswordDialog(): void {
  //   const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
  //     width: '400px',
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('The dialog was closed', result);
  //   });
  // }
 
  // imageUrl: string | null = null;

  // onFileSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e: ProgressEvent<FileReader>) => {
  //       if (typeof e.target?.result === 'string') {
  //         this.imageUrl = e.target.result;
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  data = MENU_SETTING;
  constructor(private router: Router,
    private authenticationService : AuthenticationService
  ) { }

  ngOnInit(): void { }

  checkAuth(roleName : string) : boolean{
    return this.authenticationService.existAuthorization(roleName);
  }

  goToRoute(route: string) {
    this.router.navigate([route]);
  }

  }
