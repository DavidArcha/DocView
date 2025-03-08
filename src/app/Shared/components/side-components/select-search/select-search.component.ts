import { ChangeDetectorRef, Component, QueryList, ViewChildren, OnInit, OnDestroy } from '@angular/core';
import { DropdownItem } from '../../../interfaces/table-dropdown.interface';
import { SearchService } from '../../../services/search.service';
import { LanguageService } from '../../../services/language.service';
import { AccordionItem } from '../../../interfaces/accordian-list.interface';
import { Subject, takeUntil, finalize, catchError, of, BehaviorSubject } from 'rxjs';
import { AccordionSectionComponent } from '../../accordionControl/accordion-section/accordion-section.component';

@Component({
  selector: 'app-select-search',
  standalone: false,
  templateUrl: './select-search.component.html',
  styleUrl: './select-search.component.scss'
})
export class SelectSearchComponent implements OnInit, OnDestroy {

  // Add ViewChildren to access accordion sections
  @ViewChildren(AccordionSectionComponent) accordionSections!: QueryList<AccordionSectionComponent>;

  // First System Fields Accordion Data start
  public firstSystemFieldsData: AccordionItem[] = [];
  //First System Fields Accordion Data end

  //System type data configuration start
  systemTypeData: DropdownItem[] = [];
  currentLanguage = 'en';
  selectedSystemTypeValueIds: string[] = [];
  selectedSystemTypeValue: DropdownItem | DropdownItem[] | null = null;

  // Loading state management
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.loadingSubject.asObservable();
  public isLoading: boolean = false;
  public loadingSystemTypes: boolean = false;
  public hasError: boolean = false;
  public errorMessage: string = '';

  private clearingDropdown = false;
  private _showGroupDataOutside: boolean = false;
  private destroy$ = new Subject<void>();

  // Improved system fields accordion data with state tracking
  public systemFieldsAccData: AccordionItem[] = [];
  public selectedFields: { parent: { id: string, label: string }, field: { id: string, label: string }, path: string }[] = [];

  set showGroupDataOutside(value: boolean) {
    this._showGroupDataOutside = value;
    localStorage.setItem('showGroupDataOutside', value.toString());
  }

  get showGroupDataOutside(): boolean {
    return this._showGroupDataOutside;
  }

  constructor(
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    // Subscribe to loading state changes
    this.loadingSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
        this.changeDtr.detectChanges();
      });

    // Subscribe to language changes
    this.languageService.language$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        this.currentLanguage = lang;
        this.loadSystemTypeFields(lang);
        // Load from localStorage if available
        this.loadSelectedSystemTypeValuesFromStorage();
      });

    // Load stored selection preferences
    this.loadShowGroupDataOutsideFromStorage();
  }

  // Load stored preferences
  private loadShowGroupDataOutsideFromStorage(): void {
    const stored = localStorage.getItem('showGroupDataOutside');
    if (stored) {
      this._showGroupDataOutside = stored === 'true';
    }
  }

  // Handle selected value change for list view
  onSelectedSystemTypeValueChange(selectedValues: DropdownItem[]): void {
    // When a new item is selected, collapse all accordion sections
    if (this.accordionSections) {
      this.accordionSections.forEach(section => section.collapse());
    }

    this.selectedSystemTypeValue = selectedValues.length === 1 ? selectedValues[0] : selectedValues;

    if (selectedValues.length === 0 && !this.clearingDropdown) {
      // Just clear the dropdown selection without affecting the accordion data
      this.selectedSystemTypeValue = null;
      this.selectedSystemTypeValueIds = [];
      this.saveSelectedSystemTypeValuesToStorage(null);
      this.systemFieldsAccData = [];
      return;
    }

    this.clearingDropdown = false; // Reset the flag
    // Extract the id from the selected value(s)
    const selectedId = Array.isArray(this.selectedSystemTypeValue) ?
      this.selectedSystemTypeValue.map(item => item.id) :
      this.selectedSystemTypeValue?.id;

    if (selectedId) {
      // Pass the id and current language to loadAccordionData
      this.loadAccordionData(selectedId, this.currentLanguage);
      this.updateSelectedSystemTypeValueIds();
      this.saveSelectedSystemTypeValuesToStorage(this.selectedSystemTypeValue);
    }
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
  saveSelectedSystemTypeValuesToStorage(selectedValues: DropdownItem | DropdownItem[] | null): void {
    localStorage.setItem('selectedSystemTypeValues', JSON.stringify(selectedValues));
  }

  // Load System Type Fields with improved error handling
  loadSystemTypeFields(lang: string): void {
    this.loadingSystemTypes = true;
    this.hasError = false;

    this.searchService.getSystemTypeFieldsByLang(lang)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingSystemTypes = false;
          this.changeDtr.detectChanges();
        }),
        catchError(err => {
          this.hasError = true;
          this.errorMessage = 'Failed to load system types. Please try again.';
          console.error('Error loading system type fields:', err);
          return of([]);
        })
      )
      .subscribe({
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
        }
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

  // Add a method to handle clearing the dropdown explicitly
  clearDropdownSelection(): void {
    this.clearingDropdown = true;
    this.selectedSystemTypeValue = null;
    this.selectedSystemTypeValueIds = [];
    this.saveSelectedSystemTypeValuesToStorage(null);
    this.systemFieldsAccData = [];
    // Also collapse all accordion sections
    if (this.accordionSections) {
      this.accordionSections.forEach(section => section.collapse());
    }
  }

  // Load Accordion Data with improved state management
  loadAccordionData(selectedSysType: any, lang: string): void {
    this.loadingSubject.next(true);
    this.hasError = false;

    this.searchService.getSystemFieldsAccData(selectedSysType, lang)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingSubject.next(false);
        }),
        catchError(err => {
          this.hasError = true;
          this.errorMessage = 'Failed to load field data. Please try again.';
          console.error('Error loading accordion data:', err);
          return of([]);
        })
      )
      .subscribe({
        next: (fields) => {
          this.systemFieldsAccData = fields;
        }
      });
  }

  // Handle Field Selection and Store Labels Instead of IDs
  onFieldSelected(event: { parent: { id: string, label: string }, field: { id: string, label: string }, path: string }): void {
    const existingIndex = this.selectedFields.findIndex(
      item => item.field.id === event.field.id && item.parent.id === event.parent.id
    );

    if (existingIndex === -1) {
      // Add new selection
      this.selectedFields.push(event);
    } else {
      // Remove existing selection
      this.selectedFields.splice(existingIndex, 1);
    }

    console.log("Updated Selected Fields:", this.selectedFields);
  }

  // New button: Clear with implementation
  clearTable(): void {
    this.selectedFields = [];
    // Collapse all accordion sections
    if (this.accordionSections) {
      this.accordionSections.forEach(section => section.collapse());
    }
  }

  // New button: Search with implementation
  searchTable(): void {
    if (this.selectedFields.length === 0) {
      alert('Please select at least one field to search');
      return;
    }

    // Here you would implement your search logic using the selectedFields
    console.log('Searching with fields:', this.selectedFields);
    // This could trigger a service call or emit an event to a parent component
  }

  // New button: Store with implementation
  storeTable(): void {
    if (this.selectedFields.length === 0) {
      alert('No fields selected to store');
      return;
    }

    // Save selected fields to localStorage or elsewhere
    localStorage.setItem('savedSearchFields', JSON.stringify(this.selectedFields));
    alert('Search criteria saved successfully');
  }

  // Improved trackBy function for ngFor performance
  trackByFn(index: number, item: AccordionItem): string {
    return item.id || index.toString();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
