import { ChangeDetectorRef, Component } from '@angular/core';
import { DropdownItem } from '../../../interfaces/table-dropdown.interface';
import { SearchService } from '../../../services/search.service';
import { LanguageService } from '../../../services/language.service';
import { AccordionItem } from '../../../interfaces/accordian-list.interface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-select-search',
  standalone: false,

  templateUrl: './select-search.component.html',
  styleUrl: './select-search.component.scss'
})
export class SelectSearchComponent {


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

  // Inject the Accordion based on the selected system type start
  public systemFieldsAccData: AccordionItem[] = [];
  private destroy$ = new Subject<void>();
  public isLoading: boolean = true;
  // Inject the Accordion based on the selected system type end

  constructor(
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService
  ) { }


  ngOnInit(): void {
    // Subscribe to language changes
    this.languageService.language$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(lang => {
      this.currentLanguage = lang;
      this.loadSystemTypeFields(lang);
      // Load from localStorage if available
      this.loadSelectedSystemTypeValuesFromStorage();
    });
  }

  //System type data configuration start
  // Handle selected value change for list view
  onSelectedSystemTypeValueChange(selectedValues: DropdownItem[]): void {
    this.selectedSystemTypeValue = selectedValues.length === 1 ? selectedValues[0] : selectedValues;

    // Extract the id from the selected value(s)
    const selectedId = Array.isArray(this.selectedSystemTypeValue) ? this.selectedSystemTypeValue.map(item => item.id) : this.selectedSystemTypeValue.id;

    // Pass the id and current language to loadAccordionData
    this.loadAccordionData(selectedId, this.currentLanguage);
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
    console.log("Current language", this.currentLanguage);
    // Load list values
    const savedListValue = localStorage.getItem('selectedSystemTypeValues');
    if (savedListValue) {
      try {
        this.selectedSystemTypeValue = JSON.parse(savedListValue);
        this.updateSelectedSystemTypeValueIds();
        if (this.selectedSystemTypeValue) {
          const selectedId = Array.isArray(this.selectedSystemTypeValue)
            ? this.selectedSystemTypeValue.map(item => item.id)
            : this.selectedSystemTypeValue.id;
          this.loadAccordionData(selectedId, this.currentLanguage);
        }
      } catch (e) {
        console.error('Error parsing saved list values', e);
        this.selectedSystemTypeValue = null;
        this.selectedSystemTypeValueIds = [];
      }
    }
  }
  //System type data configuration end.

  // Inject the Accordion based on the selected system type start

  // Load Accordion Data
  loadAccordionData(selectedSysType: any, lang: string): void {
    this.isLoading = true;
    this.searchService.getSystemFieldsAccData(selectedSysType, lang).subscribe({
      next: (fields) => {
        if (fields.length > 0) {
          this.systemFieldsAccData = fields;
          console.log("Accordion Data : ", this.systemFieldsAccData);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
  // **Handle Field Selection and Store Labels Instead of IDs**
  onFieldSelected(event: { parent: { id: string, label: string }, field: { id: string, label: string }, path: string }): void {
    console.log("Selected Fields : ", event);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  // Inject the Accordion based on the selected system type end

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
