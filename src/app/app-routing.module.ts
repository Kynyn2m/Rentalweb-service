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
  { path: 'forget-password', component: ForgetPasswordComponent },
  { path: 'confirm-password', component: ConfirmPasswordComponent },
  { path: 'login', component: AuthenticationComponent },
  { path: 'reginster', component: ReginsterComponent },

  // Admin-only routes (protected by AuthGuard)
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'role', component: RoleComponent, canActivate: [AuthGuard] },
  { path: 'user', component: UserComponent, canActivate: [AuthGuard] },

  // Publicly accessible routes
  { path: 'home', component: HomeComponent },
  { path: 'house', component: HouseComponent },
  { path: 'room', component: RoomComponent },
  { path: 'land', component: LandComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'details', component: DetailsComponent },
  { path: 'theme', component: ThemeComponent },

  // Add post route (requires user to be logged in)
  { path: 'add-post', component: AddPostComponent, canActivate: [UserAuthGuard] },

  // Default route
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Wildcard route
  { path: '**', redirectTo: 'home' }
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
