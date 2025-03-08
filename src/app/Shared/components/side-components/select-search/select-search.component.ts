import { ChangeDetectorRef, Component } from '@angular/core';
import { DropdownItem } from '../../../interfaces/table-dropdown.interface';
import { SearchService } from '../../../services/search.service';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-select-search',
  standalone: false,

  templateUrl: './select-search.component.html',
  styleUrl: './select-search.component.scss'
})
export class SelectSearchComponent {
  public isLoading: boolean = true;

  //System type data configuration start
  systemTypeData: DropdownItem[] = [];
  currentLanguage = 'en';
  selectedSystemTypeValueIds: string[] = [];
  selectedSystemTypeValue: DropdownItem | DropdownItem[] | null = null;

  private _showGroupDataOutside: boolean = false;

  set showGroupDataOutside(value: boolean) {
    this._showGroupDataOutside = value;
    localStorage.setItem('showGroupDataOutside', value.toString());
  }

  get showGroupDataOutside(): boolean {
    return this._showGroupDataOutside;
  }

  //System type data configuration end.

  constructor(
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService
  ) { }


  ngOnInit(): void {
    // Subscribe to language changes
    this.languageService.language$.subscribe(lang => {
      this.loadSystemTypeFields(lang);
      this.currentLanguage = lang;
    });

    // Load from localStorage if available
    this.loadSelectedSystemTypeValuesFromStorage();
  }

  //System type data configuration start
  // Handle selected value change for list view
  onSelectedSystemTypeValueChange(selectedValues: DropdownItem[]): void {
    this.selectedSystemTypeValue = selectedValues.length === 1 ? selectedValues[0] : selectedValues;
    console.log('Selected system type value:', this.selectedSystemTypeValue);
    this.updateSelectedSystemTypeValueIds();
    this.saveSelectedSystemTypeValuesToStorage(this.selectedSystemTypeValue);
  }

  // Update selectedValueIds from selectedListValue 
  updateSelectedSystemTypeValueIds(): void {
    if (!this.selectedSystemTypeValue) {
      this.selectedSystemTypeValueIds = [];
      return;
    }

    if (Array.isArray(this.selectedSystemTypeValue)) {
      this.selectedSystemTypeValueIds = this.selectedSystemTypeValue.map(item => item.id);
    } else {
      this.selectedSystemTypeValueIds = [this.selectedSystemTypeValue.id];
    }
  }

  // Save selected values to localStorage
  saveSelectedSystemTypeValuesToStorage(selectedValues: DropdownItem | DropdownItem[]): void {
    localStorage.setItem('selectedSystemTypeValues', JSON.stringify(selectedValues));
  }

  // Load System Type Fields
  loadSystemTypeFields(lang: string): void {
    this.searchService.getSystemTypeFieldsByLang(lang).subscribe({
      next: (fields) => {
        if (fields.length > 0) {
          this.systemTypeData = fields.map(field => ({
            id: field.id.toString(),
            label: field.label
          }));

          // Update selected values after data is loaded
          this.updateSelectedSystemTypeValueIds();
          this.changeDtr.detectChanges();
        }
      },
      error: console.error
    });
  }

  // Load selected values from localStorage
  loadSelectedSystemTypeValuesFromStorage(): void {
    // Load list values
    const savedListValue = localStorage.getItem('selectedSystemTypeValues');
    if (savedListValue) {
      try {
        this.selectedSystemTypeValue = JSON.parse(savedListValue);
        this.updateSelectedSystemTypeValueIds();
      } catch (e) {
        console.error('Error parsing saved list values', e);
        this.selectedSystemTypeValue = null;
        this.selectedSystemTypeValueIds = [];
      }
    }
  }
  //System type data configuration end.
  // New button: Clear
  clearTable(): void {
  }

  // New button: Search
  searchTable(): void {
  }

  // New button: Store
  storeTable(): void {
  }

}
