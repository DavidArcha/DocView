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
  selectedLanguage: string = 'de'; // default language

  // Use a private property with a getter and setter to persist the selection
  private _selectedMatch: string = '';
  get selectedMatch(): string {
    return this._selectedMatch;
  }
  set selectedMatch(value: string) {
    this._selectedMatch = value;
    // Persist the value so it survives page refreshes and navigation
    localStorage.setItem('textsurvey_selectedMatch', value);
  }

  dropdownData: any;

  constructor(
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    // Restore the persisted selection from localStorage if available
    const savedMatch = localStorage.getItem('textsurvey_selectedMatch');
    if (savedMatch !== null) {
      this._selectedMatch = savedMatch;
    } else {
      // Ensure an empty string so the placeholder is shown initially
      this._selectedMatch = '';
    }

    // Subscribe to language changes to update the dropdown language
    this.languageService.language$.subscribe(lang => {
      this.selectedLanguage = lang;
    });

    // Load dropdown data
    this.searchService.getDropdownData().subscribe(data => {
      this.dropdownData = data;
      // Trigger change detection if necessary
      this.changeDtr.detectChanges();
    });
  }
}