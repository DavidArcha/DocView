import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { LanguageService } from '../../Shared/services/language.service';
import { SearchService } from '../../Shared/services/search.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  searchForm!: FormGroup;
  searchQuery: string = '';
  languages = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Dutch' }
  ];
  selectedLanguage: string;
  searchEnabled: boolean = false;
  isLoading: boolean = false;
  showSearchBox: boolean = true;

  constructor(
    private router: Router,
    private languageService: LanguageService,
    private searchService: SearchService
  ) {
    // Initialize selected language (default is 'EN' if not set)
    this.selectedLanguage = this.languageService.getCurrentLang();
  }

  ngOnInit(): void {
    this.initialForm();
    this.searchService.searchEnabled$.subscribe(enabled => {
      this.searchEnabled = enabled;
    });
    this.searchService.searchQuery$.subscribe(query => {
      this.searchForm.get('searchKey')?.setValue(query);
    });

    // Check the initial route and show/hide the search box
    this.showSearchBox = this.router.url !== '/home';
    this.searchEnabled = this.router.url !== '/home';

    // Check the current route and show/hide the search box on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showSearchBox = event.url !== '/home';
      this.searchEnabled = event.url !== '/home';
    });
  }

  onLogoClick(): void {
    // Navigate to the home/dashboard route when the logo is clicked
    this.router.navigate(['/']);
  }

  initialForm() {
    this.searchForm = new FormGroup({
      searchKey: new FormControl('', {}),
    });
  }

  onSearch(): void {
    const searchQuery = this.searchForm.get('searchKey')?.value;
    if (searchQuery) {
      this.searchService.enableSearch(searchQuery);
    }
  }

  onClear(): void {
    this.searchService.clearSearch();
  }

  onLanguageChange(event: Event): void {
    // Cast event.target to HTMLSelectElement
    const target = event.target as HTMLSelectElement;
    this.selectedLanguage = target.value;
    this.languageService.setLanguage(target.value);
  }
}