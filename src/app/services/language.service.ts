import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private storageKey = 'selectedLanguage';
  private languageSubject: BehaviorSubject<string>;
  public currentLanguage$;

  constructor() {
    // Retrieve the persisted language or default to 'EN'
    const savedLanguage = localStorage.getItem(this.storageKey) || 'EN';
    this.languageSubject = new BehaviorSubject<string>(savedLanguage);
    this.currentLanguage$ = this.languageSubject.asObservable();
  }

  /**
   * Returns the current language.
   */
  getCurrentLanguage(): string {
    return this.languageSubject.value;
  }

  /**
   * Sets the current language and persists the setting.
   * @param lang The language code to set (e.g., 'EN', 'DU')
   */
  setLanguage(lang: string): void {
    this.languageSubject.next(lang);
    localStorage.setItem(this.storageKey, lang);
    // Optionally, notify any translation libraries (e.g., ngx-translate) here.
  }
}
