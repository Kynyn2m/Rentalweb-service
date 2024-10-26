import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css'],
})
export class LanguageSelectorComponent implements OnInit {
  selectedLanguage: any;
  isDropdownOpen = false;
  lan: any;
  onlyFlagSmallVisible = false;

  constructor(
    private transloco: TranslocoService,
    private elementRef: ElementRef
  ) {}

  languagesList: Array<
    Record<'imgUrl' | 'code' | 'name' | 'shorthand', string>
  > = [
    {
      imgUrl: '../../../assets/img/English-rounded.png',
      code: 'en',
      name: 'English',
      shorthand: 'ENG',
    },
    {
      imgUrl: '../../../assets/img/cambodia-rounded V2.png',
      code: 'kh',
      name: 'Khmer',
      shorthand: 'KHM',
    },
  ];

  ngOnInit(): void {
    const storedLanguage = localStorage.getItem('language');
    const defaultLanguageCode = 'en';
    const languageCode = storedLanguage || defaultLanguageCode;
    this.lan = languageCode;
    this.transloco.setActiveLang(languageCode);
    this.selectedLanguage = this.languagesList.find(
      (lang) => lang.code === languageCode
    );

    this.setDocumentDirection(languageCode);

    // Check initial screen size
    this.onlyFlagSmallVisible = window.innerWidth <= 480;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  changeLanguage(languageCode: string): void {
    this.lan = languageCode;
    this.transloco.setActiveLang(languageCode);
    localStorage.setItem('language', languageCode);
    this.selectedLanguage = this.languagesList.find(
      (lang) => lang.code === languageCode
    );
    this.isDropdownOpen = false;
    this.setDocumentDirection(languageCode);
  }

  switchLanguage(): void {
    const newLanguageCode = this.selectedLanguage.code === 'en' ? 'kh' : 'en';
    this.changeLanguage(newLanguageCode);
  }

  private setDocumentDirection(languageCode: string): void {
    document.body.style.direction = languageCode === 'fa' ? 'rtl' : 'ltr';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.onlyFlagSmallVisible = window.innerWidth <= 480;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  // Stop the Enter key from triggering any action
  toggleDropdownWithClick(event: MouseEvent): void {
    event.preventDefault();
    this.toggleDropdown();
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnterPress(event: KeyboardEvent): void {
    event.preventDefault();
  }
}
