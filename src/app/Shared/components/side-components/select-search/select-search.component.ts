import { ChangeDetectorRef, Component, QueryList, ViewChildren, OnInit, OnDestroy } from '@angular/core';
import { DropdownItem } from '../../../interfaces/table-dropdown.interface';
import { SearchService } from '../../../services/search.service';
import { LanguageService } from '../../../services/language.service';
import { AccordionItem } from '../../../interfaces/accordian-list.interface';
import { Subject, takeUntil, finalize, catchError, of, BehaviorSubject } from 'rxjs';
import { AccordionSectionComponent } from '../../accordionControl/accordion-section/accordion-section.component';
import { AccordionService } from '../../../services/accordion.service';
import { SelectedField } from '../../../interfaces/selectedFields.interface';
import { DropdownDataMapping, FieldType, FieldTypeMapping } from '../../../enums/field-types.enum';
import { DualOperators, NoValueOperators, OperatorType } from '../../../enums/operator-types.enum';

@Component({
  selector: 'app-select-search',
  standalone: false,
  templateUrl: './select-search.component.html',
  styleUrl: './select-search.component.scss'
})
export class SelectSearchComponent implements OnInit, OnDestroy {

  // Add ViewChildren to access accordion sections
  @ViewChildren(AccordionSectionComponent) accordionSections!: QueryList<AccordionSectionComponent>;

  // Add these to track each section type separately
  @ViewChildren('firstAccordion') firstAccordionSections!: QueryList<AccordionSectionComponent>;
  @ViewChildren('systemAccordion') systemAccordionSections!: QueryList<AccordionSectionComponent>;


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
  // For table data fields storage.
  public selectedFields: SelectedField[] = [];
  operationsDDData: any;

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
    private languageService: LanguageService,
    private accordionService: AccordionService
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
        this.loadFirstAccordionData(lang);
      });

    this.searchService.getDropdownData().subscribe(data => {
      this.operationsDDData = data;
    });

    // Load stored selection preferences
    this.loadShowGroupDataOutsideFromStorage();

    // Load stored system type values
    this.loadSelectedSystemTypeValuesFromStorage();

    // Load table data from localStorage if available
    const stored = localStorage.getItem('selectedFields');
    if (stored) {
      this.selectedFields = JSON.parse(stored);
    }
  }

  // Add this method to load selected values from localStorage
  loadSelectedSystemTypeValuesFromStorage(): void {
    const savedValue = localStorage.getItem('selectedSystemTypeValues');
    if (savedValue) {
      try {
        const savedValueObj = JSON.parse(savedValue);
        this.selectedSystemTypeValue = savedValueObj;

        // Update IDs for dropdown component binding
        this.updateSelectedSystemTypeValueIds();

        // Once we have system type data loaded, we'll update the labels
        // This will happen in the loadSystemTypeFields subscription
      } catch (e) {
        console.error('Error loading saved system type values', e);
        this.selectedSystemTypeValue = null;
        this.selectedSystemTypeValueIds = [];
      }
    }
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
    this.selectedSystemTypeValue = selectedValues.length === 1 ? selectedValues[0] : selectedValues;
    console.log("Selected Values:", this.selectedSystemTypeValue);
    // When a new item is selected, collapse all existing system accordion sections first
    if (this.systemAccordionSections) {
      this.systemAccordionSections.forEach(section => section.collapse());
    }

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

            // Update selected values with new language labels
            this.updateSelectedValuesWithCurrentLanguage();

            // Update selected value IDs
            this.updateSelectedSystemTypeValueIds();
            this.changeDtr.detectChanges();
          }
        }
      });
  }

  // New method to update selected values with current language
  updateSelectedValuesWithCurrentLanguage(): void {
    if (!this.selectedSystemTypeValue || this.systemTypeData.length === 0) {
      this.updateSelectedFieldsParents();
      return;
    }

    if (Array.isArray(this.selectedSystemTypeValue)) {
      // Update multiple selections with current language labels
      this.selectedSystemTypeValue = this.selectedSystemTypeValue.map(selectedItem => {
        if (!selectedItem || !selectedItem.id) return selectedItem;
        const currentItem = this.systemTypeData.find(item => item.id === selectedItem.id);
        return currentItem || selectedItem;
      });
    } else {
      // Update single selection with current language label
      // Ensure selectedSystemTypeValue is not null before accessing .id
      const id = this.selectedSystemTypeValue?.id;
      if (id) {
        const currentItem = this.systemTypeData.find(item => item.id === id);
        if (currentItem) {
          this.selectedSystemTypeValue = currentItem;
        }
      }
    }

    // Update parents in selectedFields with new language labels
    this.updateSelectedFieldsParents();

    if (this.selectedSystemTypeValue) {
      const selectedId = Array.isArray(this.selectedSystemTypeValue)
        ? this.selectedSystemTypeValue.map(item => item.id)
        : this.selectedSystemTypeValue.id;
      this.loadAccordionData(selectedId, this.currentLanguage);
    }

    // Save updated values back to localStorage
    this.saveSelectedSystemTypeValuesToStorage(this.selectedSystemTypeValue);
  }

  // Add this method to update parent in selectedFields
  updateSelectedFieldsParents(): void {
    if (this.selectedFields.length === 0 || this.systemTypeData.length === 0) {
      return;
    }

    // Loop through each selectedField and update the parent label using systemTypeData
    this.selectedFields = this.selectedFields.map(field => {
      // Skip fields without a parent or parent ID
      if (!field.parent || !field.parent.id) {
        return field;
      }

      // Find the updated system type data with current language
      const currentSystemType = this.systemTypeData.find(item => item.id === field.parent.id);

      // If found, update the parent label while keeping the same ID
      if (currentSystemType) {
        field.parent = {
          id: field.parent.id,
          label: currentSystemType.label || '' // Ensure it's never undefined
        };
      }

      return field;
    });

    // Save updated fields to localStorage
    this.updateLocalStorage();
  }

  // Add a method to handle clearing the dropdown explicitly
  clearDropdownSelection(): void {
    this.clearingDropdown = true;
    this.selectedSystemTypeValue = null;
    this.selectedSystemTypeValueIds = [];
    this.saveSelectedSystemTypeValuesToStorage(null);
    this.systemFieldsAccData = [];
    // Make sure to collapse all system accordions when clearing the dropdown
    if (this.systemAccordionSections) {
      this.systemAccordionSections.forEach(section => section.collapse());
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
          // Restore expansion state for these sections
          this.accordionService.restoreAccordionState('system', fields);
          setTimeout(() => this.changeDtr.detectChanges(), 0);
        }
      });
  }

  // Handle Field Selection and Store Labels Instead of IDs
  onFieldSelected(event: { parent: { id: string, label: string }, field: { id: string, label: string }, path: string }): void {
    console.log("Selected Values in onfield:", this.selectedSystemTypeValue);
    // Replace parent with selectedSystemTypeValue
    const parent = this.selectedSystemTypeValue
      ? {
        id: Array.isArray(this.selectedSystemTypeValue)
          ? this.selectedSystemTypeValue[0].id
          : this.selectedSystemTypeValue.id,
        label: Array.isArray(this.selectedSystemTypeValue)
          ? this.selectedSystemTypeValue[0].label || '' // Ensure it's never undefined
          : this.selectedSystemTypeValue.label || ''    // Ensure it's never undefined
      }
      : { id: '', label: '' }; // Empty string as default

    this.handleFieldSelection(event, parent);
  }

  // First System Fields Accordion Data start
  loadFirstAccordionData(lang: string): void {
    this.loadingSubject.next(true);
    this.hasError = false;

    this.searchService.getSystemFields(lang)
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
          this.firstSystemFieldsData = fields;
          // Restore expansion state for these sections
          this.accordionService.restoreAccordionState('first', fields);
          setTimeout(() => this.changeDtr.detectChanges(), 0);
        }
      });
  }

  // Handle Field Selection for first accordion
  onFirstAccFieldSelected(event: { parent: { id: string, label: string }, field: { id: string, label: string }, path: string }): void {
    // Set parent to null/undefined
    const parent = { id: '', label: '' };

    this.handleFieldSelection(event, parent);
  }
  // First System Fields Accordion Data end

  // Common method for handling field selection from any accordion
  private handleFieldSelection(
    event: { parent: { id: string, label: string }, field: { id: string, label: string }, path: string },
    parentOverride?: { id: string, label: string } | null
  ): void {
    // Use provided parent override or default from event
    const parent = parentOverride || event.parent;

    const operatorOptions = this.getOperatorOptions(event.field.id);

    // Initialize with default operator object
    const defaultOperator = {
      id: 'select',
      label: this.currentLanguage === 'de' ? 'Auswählen' : 'Select'
    };
    const defaultValue = null;
    const dropdownData = this.getDropdownDataForField(event.field.id) || [];

    // Create a new SelectedField object with all required properties
    const selectedField: SelectedField = {
      parent: parent,
      field: event.field,
      operator: defaultOperator,
      operatorOptions: operatorOptions,
      value: defaultValue,
      dropdownData: dropdownData
    };

    this.selectedFields.push(selectedField);
    console.log('Selected Fields:', this.selectedFields);
    this.updateLocalStorage();
  }

  // Save updated table data to localStorage
  updateLocalStorage(): void {
    localStorage.setItem('selectedFields', JSON.stringify(this.selectedFields));
  }
  /**
   * Returns the operator dropdown options based on the selected field.
   */
  getOperatorOptions(field: string): any[] {
    const fieldLower = field;
    console.log('Field:', fieldLower);
    switch (FieldTypeMapping[fieldLower]) {
      case FieldType.Bool:
        return this.operationsDDData.boolOperations;
      case FieldType.Text:
        return this.operationsDDData.tOperations;
      case FieldType.Date:
        return this.operationsDDData.dateOperations;
      case FieldType.Number:
        return this.operationsDDData.numberOperations;
      case FieldType.Dropdown:
        return this.operationsDDData.stringOperations;
      default:
        return [];
    }
  }

  getDropdownDataForField(fieldId: string): any[] {
    const dataSource = DropdownDataMapping[fieldId.toLowerCase()];
    switch (dataSource) {
      // case 'stateData':
      //   return this.stateData;
      // case 'brandData':
      //   return this.brandData;
      default:
        return [];
    }
  }

  /**
     * When the operator value changes, update the operator and reset the value.
     */
  onOperatorChange(event: { newOperator: string, index: number }): void {
    const field = this.selectedFields[event.index];

    if (!field) {
      return;
    }

    // Handle 'select' option selection
    if (event.newOperator === 'select') {
      field.operator = {
        id: 'select',
        label: this.currentLanguage === 'de' ? 'Auswählen' : 'Select'
      };
      field.value = null;
      field.operatorTouched = true;
      this.updateLocalStorage();
      return;
    }

    const selectedOption = field.operatorOptions.find(op => op.id === event.newOperator);

    if (selectedOption) {
      field.operator = {
        id: selectedOption.id,
        label: selectedOption[this.currentLanguage] || selectedOption.id
      };

      // Reset value based on operator type
      if (DualOperators.includes(selectedOption.id as OperatorType)) {
        field.value = ['', ''];
      } else if (NoValueOperators.includes(selectedOption.id as OperatorType)) {
        field.value = null;
      } else {
        field.value = '';
      }

      field.operatorTouched = true;
      this.updateLocalStorage();
    }
  }

  // Delete a row from the selected fields table.
  onDeleteSelectedField(index: number): void {
    this.selectedFields.splice(index, 1);
    this.updateLocalStorage();
    localStorage.removeItem('savedAccordionState');
  }

  // New button: Clear with implementation
  clearTable(): void {
    this.selectedFields = [];
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
