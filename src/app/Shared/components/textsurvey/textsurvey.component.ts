import { ChangeDetectorRef, Component, OnInit, Input } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { LanguageService } from '../../services/language.service';

interface SurveySelections {
  selectedMatch?: string;
  selectedState?: string;
  selectedNumber?: string;
  // add more fields as needed
}

@Component({
  selector: 'app-textsurvey',
  standalone: false,
  templateUrl: './textsurvey.component.html',
  styleUrl: './textsurvey.component.scss'
})
export class TextsurveyComponent implements OnInit {
  selectedLanguage: string = 'de'; // default language

  // Our object holding all selections.
  surveySelections: SurveySelections = {
    selectedMatch: '',
    selectedState: '',
    selectedNumber: ''
  };
  dropdownData: any;

  constructor(
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    // Restore the persisted selections from localStorage if available
    const savedSelections = localStorage.getItem('textsurvey_selections');
    if (savedSelections) {
      this.surveySelections = JSON.parse(savedSelections);
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

  // Getter and Setter for selectedMatch
  get selectedMatch(): string {
    return this.surveySelections.selectedMatch || '';
  }
  set selectedMatch(value: string) {
    this.surveySelections.selectedMatch = value;
    this.saveSelections();
  }

  // Getter and Setter for selectedState
  get selectedState(): string {
    return this.surveySelections.selectedState || '';
  }
  set selectedState(value: string) {
    this.surveySelections.selectedState = value;
    this.saveSelections();
  }

  // Getter and Setter for selectedNumber
  get selectedNumber(): string {
    return this.surveySelections.selectedNumber || '';
  }
  set selectedNumber(value: string) {
    this.surveySelections.selectedNumber = value;
    this.saveSelections();
  }

  // Persist the entire selections object to localStorage
  private saveSelections(): void {
    localStorage.setItem('textsurvey_selections', JSON.stringify(this.surveySelections));
  }
}