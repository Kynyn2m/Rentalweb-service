import { NgModule, enableProdMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { SettingComponent } from './setting/setting.component';
import { RoleComponent } from './setting/role/role.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTreeModule } from '@angular/material/tree';
import { DragDropModule, CdkDrag } from '@angular/cdk/drag-drop';
import {
  HttpClientModule,
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';
import { TranslocoRootModule } from './transloco-http-loader';
import { ErrInterceptor } from './_helpers/err.interceptor';
import { ForgetPasswordComponent } from './authentication/forget-password/forget-password.component';
import { ConfirmPasswordComponent } from './authentication/confirm-password/confirm-password.component';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserComponent } from './setting/user/user.component';
import { UserFormComponent } from './setting/user/user-form/user-form.component';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { UserAddComponent } from './setting/user/user-add/user-add.component';
import { AssignRoleComponent } from './setting/user/assign-role/assign-role.component';
import { EditRoleComponent } from './setting/user/edit-role/edit-role.component';
import { AddRoleDesComponent } from './setting/role/add-role-des/add-role-des.component';
import { ProfileComponent } from './profile/profile.component';
import { ChangePasswordComponent } from './authentication/change-password/change-password.component';
import { PermissionComponent } from './setting/role/permission/permission.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatSliderModule } from '@angular/material/slider';
import { ColorPickerModule } from 'ngx-color-picker';
import { QRCodeModule } from 'angularx-qrcode';
import { ThemeComponent } from './components/theme/theme.component';
import { MerchantComponent } from './pages/merchant/merchant.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';
import { HouseComponent } from './house/house.component';
import { ReginsterComponent } from './authentication/reginster/reginster.component';
import { RoomComponent } from './pages/room/room.component';
import { LandComponent } from './pages/land/land.component';
import { ContactComponent } from './contact/contact.component';
import { AddPostComponent } from './add-post/add-post.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AboutUsComponent } from './about-us/about-us.component';
import { DetailsComponent } from './details/details.component';
import { AdsComponent } from './ads/ads.component';
// import { GoogleMapsModule } from '@angular/google-maps';

const httpLoaderFactory = (http: HttpClient) => new TranslocoRootModule();
@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    DashboardComponent,
    AuthenticationComponent,
    SettingComponent,
    LanguageSelectorComponent,
    ForgetPasswordComponent,
    ConfirmPasswordComponent,
    ConfirmComponent,
    UserComponent,
    UserFormComponent,
    UserAddComponent,
    AssignRoleComponent,
    EditRoleComponent,
    RoleComponent,
    AddRoleDesComponent,
    ProfileComponent,
    ChangePasswordComponent,
    PermissionComponent,
    ThemeComponent,
    MerchantComponent,
    HomeComponent,
    FooterComponent,
    HouseComponent,
    ReginsterComponent,
    RoomComponent,
    LandComponent,
    ContactComponent,
    AddPostComponent,
    AboutUsComponent,
    DetailsComponent,
    AdsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatGridListModule,
    MatMenuModule,
    MatTreeModule,
    DragDropModule,
    HttpClientModule,
    MatDialogModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBottomSheetModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatTabsModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    TranslocoRootModule,
    MatTooltipModule,
    ClipboardModule,
    MatSliderModule,
    ColorPickerModule,
    QRCodeModule,
    CdkDrag,
    FlexLayoutModule,
    // GoogleMapsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrInterceptor, multi: true },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

enableProdMode();
