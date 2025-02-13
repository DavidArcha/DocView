import { ChangeDetectorRef, Component, OnInit, Input } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-textsurvey',
  standalone: false,
  templateUrl: './textsurvey.component.html',
  styleUrl: './textsurvey.component.scss'
})
export class TextsurveyComponent implements OnInit {
  selectedLanguage: string = 'de'; // Default language

  dropdownData: any;

  private _selectedMatch: any;

  get selectedMatch(): any {
    return this._selectedMatch;
  }

  set selectedMatch(value: any) {
    this._selectedMatch = value;
    // Save the selected value in localStorage whenever it changes
    localStorage.setItem('selectedMatch', value);
  }

  constructor(
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService,
  ) { }

  ngOnInit(): void {
    // Restore the persisted value from localStorage (if it exists)
    const savedMatch = localStorage.getItem('selectedMatch');
    if (savedMatch !== null) {
      this._selectedMatch = savedMatch;
    }

    // Subscribe to language changes
    this.languageService.language$.subscribe(lang => {
      this.selectedLanguage = lang;
    });

    // Load the dropdown data
    this.searchService.getDropdownData().subscribe(data => {
      this.dropdownData = data;
      this.changeDtr.detectChanges();
    });
  }
}