import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { AuthGuard } from './_helpers/auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SettingComponent } from './setting/setting.component';
import { ForgetPasswordComponent } from './authentication/forget-password/forget-password.component';
import { ConfirmPasswordComponent } from './authentication/confirm-password/confirm-password.component';
import { UserComponent } from './setting/user/user.component';
import { RoleComponent } from './setting/role/role.component';
import { ProfileComponent } from './profile/profile.component';
import { ThemeComponent } from './components/theme/theme.component';
import { MerchantComponent } from './pages/merchant/merchant.component';
import { HomeComponent } from './home/home.component';
import { HouseComponent } from './house/house.component';
import { ReginsterComponent } from './authentication/reginster/reginster.component';

const routes: Routes = [
  { path: 'forget-password', component: ForgetPasswordComponent },
  { path: 'confirm-password', component: ConfirmPasswordComponent },
  { path: 'login', component: AuthenticationComponent },
  { path: 'reginster', component: ReginsterComponent },

  // // Auth
  // { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  // { path: 'setting', component: SettingComponent, canActivate: [AuthGuard] },
  // { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  // { path: 'user', component: UserComponent, canActivate: [AuthGuard] },
  // { path: 'role', component: RoleComponent, canActivate: [AuthGuard] },
  // { path: 'theme', component: ThemeComponent, canActivate: [AuthGuard] },

  // Dev
  { path: 'home', component: HomeComponent },
  { path: 'house', component: HouseComponent },

  { path: 'theme', component: ThemeComponent },

  // otherwise redirect to index
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
