import { HttpClient } from '@angular/common/http';
import {
  TRANSLOCO_LOADER,
  Translation,
  TRANSLOCO_CONFIG,
  translocoConfig,
  TranslocoModule,
} from '@ngneat/transloco';
import { Injectable, NgModule } from '@angular/core';
// isDevMode

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoHttpLoader {
  constructor(private http: HttpClient) { }
  getTranslation(lang: string) {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}

@NgModule({
  exports: [TranslocoModule],
  providers: [
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: ['en', 'kh'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        // prodMode: environment.production,
      }),
    },
    { provide: TRANSLOCO_LOADER, useClass: TranslocoHttpLoader },
  ],
})

export class TranslocoRootModule { }
