import { NgModule } from '@angular/core';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { ForgetPasswordComponent } from './authentication/forget-password/forget-password.component';
import { ConfirmPasswordComponent } from './authentication/confirm-password/confirm-password.component';
import { ReginsterComponent } from './authentication/reginster/reginster.component';
import { ProfileComponent } from './profile/profile.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';
import { HouseComponent } from './house/house.component';
import { RoomComponent } from './pages/room/room.component';
import { LandComponent } from './pages/land/land.component';
import { ThemeComponent } from './components/theme/theme.component';
import { AddPostComponent } from './add-post/add-post.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { DetailsComponent } from './details/details.component';
import { RoleComponent } from './setting/role/role.component';
import { UserComponent } from './setting/user/user.component';
import { AuthGuard } from './authentication/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminGuard } from './authentication/admin.guard';
import { NonAdminGuard } from './authentication/non-admin.guard';
import { AddPostHouseComponent } from './add-post/add-post-house/add-post-house.component';
import { AddPostLandComponent } from './add-post/add-post-land/add-post-land.component';
import { HouseListComponent } from './dashboard/house-list/house-list.component';
import { AddPostRoomComponent } from './add-post/add-post-room/add-post-room.component';
import { RoomListComponent } from './dashboard/room-list/room-list.component';
import { DetailRoomComponent } from './pages/room/detail-room/detail-room.component';
import { DetailLandComponent } from './pages/land/detail-land/detail-land.component';
import { LandListComponent } from './dashboard/land-list/land-list.component';

const routes: Routes = [
  { path: 'forget-password', component: ForgetPasswordComponent },
  { path: 'confirm-password', component: ConfirmPasswordComponent },
  { path: 'login', component: AuthenticationComponent },
  { path: 'reginster', component: ReginsterComponent },

  // Admin-only routes (protected by AuthGuard)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'room-list',
    component: RoomListComponent,
    canActivate: [AdminGuard],
  },

  { path: 'role', component: RoleComponent, canActivate: [AdminGuard] },
  { path: 'user', component: UserComponent, canActivate: [AdminGuard] },
  {
    path: 'house-list',
    component: HouseListComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'land-list',
    component: LandListComponent,
    canActivate: [AdminGuard],
  },
  // Publicly accessible routes
  { path: 'home', component: HomeComponent, canActivate: [NonAdminGuard] },
  { path: 'house', component: HouseComponent, canActivate: [NonAdminGuard] },
  { path: 'room', component: RoomComponent, canActivate: [NonAdminGuard] },
  { path: 'land', component: LandComponent, canActivate: [NonAdminGuard] },
  {
    path: 'about-us',
    component: AboutUsComponent,
    canActivate: [NonAdminGuard],
  },
  {
    path: 'details/:id',
    component: DetailsComponent,
    canActivate: [NonAdminGuard],
  },
  {
    path: 'details-room/:id',
    component: DetailRoomComponent,
    canActivate: [NonAdminGuard],
  },
  {
    path: 'details-land/:id',
    component: DetailLandComponent,
    canActivate: [NonAdminGuard],
  },
  { path: 'theme', component: ThemeComponent, canActivate: [NonAdminGuard] },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [NonAdminGuard],
  },
  {
    path: 'add-post-house',
    component: AddPostHouseComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add-post-land',
    component: AddPostLandComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add-post-room',
    component: AddPostRoomComponent,
    canActivate: [AuthGuard],
  },
  // Add post route (requires user to be logged in)
  {
    path: 'add-post',
    component: AddPostComponent,
    canActivate: [NonAdminGuard],
  },
  {
    path: 'contact',
    component: ContactComponent,
    canActivate: [NonAdminGuard],
  },
  // Default route
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Wildcard route
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
