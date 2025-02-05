import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private languageSubject = new BehaviorSubject<string>(this.getDefaultLanguage());

  constructor(private translateService: TranslateService) {
    // Set the default language to 'DE'
    this.translateService.setDefaultLang('de');
    this.translateService.use(this.getDefaultLanguage());
    this.setLanguage(this.getDefaultLanguage());
  }

  // Observable to allow other components to subscribe to language changes
  language$ = this.languageSubject.asObservable();

  // Get the default language from localStorage or fall back to 'DE'
  private getDefaultLanguage(): string {
    return localStorage.getItem('selectedLanguage') || 'de';
  }

  // Method to change language and persist in localStorage
  setLanguage(language: string) {
    this.languageSubject.next(language);
    localStorage.setItem('selectedLanguage', language);
    this.translateService.use(language);
  }

  getCurrentLang(): string {
    return this.languageSubject.value;
  }
}
