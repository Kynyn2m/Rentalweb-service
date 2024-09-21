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
import { UserAuthGuard } from './authentication/user-auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: 'forget-password', component: ForgetPasswordComponent, },
  { path: 'confirm-password', component: ConfirmPasswordComponent },
  { path: 'login', component: AuthenticationComponent },
  { path: 'reginster', component: ReginsterComponent },

  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },

  { path: 'profile', component: ProfileComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'role', component: RoleComponent ,canActivate:[AuthGuard] },
  { path: 'user', component: UserComponent ,canActivate:[AuthGuard]},

  { path: 'home', component: HomeComponent ,canActivate:[UserAuthGuard]},
  { path: 'house', component: HouseComponent ,canActivate:[UserAuthGuard]},
  { path: 'room', component: RoomComponent,canActivate:[UserAuthGuard] },
  { path: 'land', component: LandComponent,canActivate:[UserAuthGuard] },
  { path: 'add-post', component: AddPostComponent,canActivate:[UserAuthGuard] },
  { path: 'about-us', component: AboutUsComponent,canActivate:[UserAuthGuard] },
  { path: 'details', component: DetailsComponent ,canActivate:[UserAuthGuard]},

  { path: 'theme', component: ThemeComponent },

  // Fallback route
  { path: '**', redirectTo: 'home' },
];

const routerOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled',
  onSameUrlNavigation: 'reload',
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
