import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-header',
  standalone: false,

  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  searchQuery: string = '';
  languages = [
    { code: 'EN', label: 'English' },
    { code: 'DU', label: 'Dutch' }
  ];
  selectedLanguage: string;

  constructor(
    private router: Router,
    private languageService: LanguageService,
    private searchService: SearchService
  ) {
    // Initialize selected language (default is 'EN' if not set)
    this.selectedLanguage = this.languageService.getCurrentLanguage();
  }

  onLogoClick(): void {
    // Navigate to the home/dashboard route when the logo is clicked
    this.router.navigate(['/']);
  }

  onSearch(): void {
    if (this.searchQuery.trim() !== '') {
      this.searchService.search(this.searchQuery).subscribe(
        results => {
          // Process search results or navigate to a search results page
          console.log('Search results:', results);
        },
        error => {
          // Handle error (for example, display a user-friendly error message)
          console.error('Search error:', error);
        }
      );
    }
  }

  onLanguageChange(event: Event): void {
    // Cast event.target to HTMLSelectElement
    const target = event.target as HTMLSelectElement;
    this.selectedLanguage = target.value;
    this.languageService.setLanguage(target.value);
  }
}