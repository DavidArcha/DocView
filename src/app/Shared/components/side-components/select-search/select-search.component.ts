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
import { SearchCriteria } from '../../../interfaces/search-criteria.interface';
import { SearchRequest } from '../../../interfaces/search-request.interface';

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
  searchCriteria: SearchCriteria[] = [];

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
    const stored = localStorage.getItem('savedSearchFields');
    if (stored) {
      try {
        const parsedCriteria = JSON.parse(stored) as SearchCriteria[];
        // Restore proper value formats for arrays
        this.selectedFields = this.restoreValueFormat(parsedCriteria);
      } catch (e) {
        console.error('Error loading saved search fields', e);
        this.selectedFields = [];
      }
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

        // Only load accordion data if we have a selected system type
        if (this.selectedSystemTypeValue) {
          const selectedId = Array.isArray(this.selectedSystemTypeValue) ?
            this.selectedSystemTypeValue.map(item => item.id) :
            this.selectedSystemTypeValue.id;

          if (selectedId) {
            // We'll load this once the language and system type data are available
            console.log('Will load accordion data for selected system:', selectedId);
          }
        } else {
          // If no system type is selected, ensure accordion data is empty
          this.systemFieldsAccData = [];
        }
      } catch (e) {
        console.error('Error loading saved system type values', e);
        this.selectedSystemTypeValue = null;
        this.selectedSystemTypeValueIds = [];
        this.systemFieldsAccData = []; // Ensure accordion is empty
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
    if (this.systemTypeData.length === 0) {
      return;
    }

    // Update selectedSystemTypeValue with current language labels
    if (this.selectedSystemTypeValue) {
      if (Array.isArray(this.selectedSystemTypeValue)) {
        // Update multiple selections with current language labels
        this.selectedSystemTypeValue = this.selectedSystemTypeValue.map(selectedItem => {
          if (!selectedItem || !selectedItem.id) return selectedItem;
          const currentItem = this.systemTypeData.find(item => item.id === selectedItem.id);
          return currentItem || selectedItem;
        });
      } else {
        // Update single selection with current language label
        const id = this.selectedSystemTypeValue?.id;
        if (id) {
          const currentItem = this.systemTypeData.find(item => item.id === id);
          if (currentItem) {
            this.selectedSystemTypeValue = currentItem;
          }
        }
      }

      // Save updated values back to localStorage
      this.saveSelectedSystemTypeValuesToStorage(this.selectedSystemTypeValue);

      // If we have a selected system type, load its accordion data for display
      const selectedId = Array.isArray(this.selectedSystemTypeValue) ?
        this.selectedSystemTypeValue.map(item => item.id) :
        this.selectedSystemTypeValue?.id;

      if (selectedId) {
        this.loadAccordionData(selectedId, this.currentLanguage);
      }
    } else {
      // If no system type is selected, clear the accordion data
      this.systemFieldsAccData = [];
    }

    // Get all system type IDs used in selected fields for label updates only
    const allUsedSystemTypeIds = this.getAllSelectedSystemTypeIds();
    if (allUsedSystemTypeIds.length > 0) {
      this.loadAllUsedSystemFields(allUsedSystemTypeIds);
    }
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
          // Update field labels in selectedFields after systemFieldsAccData is loaded
          this.updateSelectedFieldsParents();

          setTimeout(() => this.changeDtr.detectChanges(), 0);
        }
      });
  }

  // Handle Field Selection and Store Labels Instead of IDs
  onFieldSelected(event: { parent: { id: string, label: string }, field: { id: string, label: string }, path: string }): void {
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

          // Update field labels in selectedFields after firstSystemFieldsData is loaded
          this.updateSelectedFieldsParents();

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
    switch (FieldTypeMapping[fieldLower]) {
      case FieldType.Bool:
        return this.operationsDDData.boolOperations;
      case FieldType.Text:
        return this.operationsDDData.stringOperations;
      case FieldType.Date:
        return this.operationsDDData.dateOperations;
      case FieldType.Number:
        return this.operationsDDData.numberOperations;
      case FieldType.Dropdown:
        return this.operationsDDData.stringOperations;
      case FieldType.Button:
        return this.operationsDDData.timeOperations;
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

  onSearchSelectedField(selectedRow: SelectedField): void {
    // Convert the selected row to a search criteria following the interface
    const searchCriteria: SearchCriteria = {
      // Use parentSelected if available, otherwise fall back to parent
      parent: selectedRow.parentSelected || selectedRow.parent,
      field: {
        id: selectedRow.field.id,
        label: selectedRow.field.label
      },
      operator: {
        id: selectedRow.operator?.id || '',
        label: selectedRow.operator?.label || ''
      },
      value: selectedRow.value || null
    };

    console.log("Search criteria for backend:", searchCriteria);

    // Add this to your searchCriteria array
    this.searchCriteria.push(searchCriteria);

    // Here you would send the criteria to the backend
    // this.searchService.search(searchCriteria).subscribe(...);
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
  }

  // New button: Store with simplified implementation
  storeTable(): void {
    if (this.selectedFields.length === 0) {
      alert('No fields selected to store');
      return;
    }

    // Validate all fields
    const invalidFields = this.selectedFields.filter(field => {
      // Apply the same validation logic here
      field.parentTouched = true;
      field.operatorTouched = true;
      field.valueTouched = true;

      // Validation logic
      const hasParent = field.parentSelected || (field.parent && field.parent.id);
      const hasOperator = field.operator && field.operator.id && field.operator.id !== 'select';
      const hasValue = field.value !== undefined && field.value !== null && field.value !== '';

      return !hasParent || !hasOperator ||
        (!NoValueOperators.includes(field.operator?.id?.toLowerCase() as OperatorType) && !hasValue);
    });

    if (invalidFields.length > 0) {
      alert('Please fix validation errors before saving');
      return;
    }

    // Convert to search criteria format with special handling for array values
    const searchCriteria = this.selectedFields.map(field => {
      // Format the value - if it's an array, join with "-"
      let formattedValue = field.value;

      // Check if value is an array and convert to hyphenated string
      if (Array.isArray(field.value)) {
        // Get values from the array - handle both primitive and object values
        const values = field.value.map(item => {
          // If item is an object with id/label (like dropdown items)
          if (item && typeof item === 'object' && 'id' in item) {
            return item.id;
          }
          // Otherwise return the item itself
          return item;
        });

        // Join the values with "-"
        formattedValue = values.join('-');
      } else if (field.value && typeof field.value === 'object' && 'id' in field.value) {
        // For single dropdown items that are objects
        formattedValue = field.value.id;
      }

      // Return the search criteria without metadata
      return {
        parent: field.parentSelected || field.parent,
        field: {
          id: field.field.id,
          label: field.field.label
        },
        operator: {
          id: field.operator?.id || '',
          label: field.operator?.label || ''
        },
        value: formattedValue
      };
    });

    // Create a search request
    const searchRequest: SearchRequest = {
      title: {
        id: 'search_request',
        label: 'Search Request'
      },
      fields: searchCriteria
    };

    console.log('Search criteria to save:', searchRequest);
    localStorage.setItem('savedSearchFields', JSON.stringify(searchCriteria));

    // Send to backend
    // this.searchService.saveSearchCriteria(searchCriteria)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: () => {
    //       alert('Search criteria saved successfully');
    //     },
    //     error: (error) => {
    //       console.error('Error saving search criteria:', error);
    //       alert('Failed to save search criteria. Please try again.');
    //     }
    //   });
  }

  // Improved trackBy function for ngFor performance
  trackByFn(index: number, item: AccordionItem): string {
    return item.id || index.toString();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Update method to change parent, field, and operator labels based on language
  updateSelectedFieldsParents(): void {
    if (this.selectedFields.length === 0) {
      return;
    }
    // Prepare a map of all fields from firstSystemFieldsData for quick lookup
    const firstSystemFieldsMap = new Map();
    this.extractFields(this.firstSystemFieldsData, firstSystemFieldsMap);
    // Only extract fields from systemFieldsAccData if we have selected system type
    const systemFieldsMap = new Map();
    if (this.systemFieldsAccData.length > 0) {
      this.extractFields(this.systemFieldsAccData, systemFieldsMap);
    } else {
      console.log('SYSTEM FIELDS MAP: Empty - No system fields data loaded');
    }

    // Loop through each selectedField and update labels efficiently
    this.selectedFields = this.selectedFields.map((selectedField, index) => {
      // 1. Update parent labels if we have systemTypeData
      if (selectedField.parent && selectedField.parent.id && this.systemTypeData.length > 0) {
        const currentSystemType = this.systemTypeData.find(item => item.id === selectedField.parent.id);
        if (currentSystemType) {
          selectedField.parent = {
            id: selectedField.parent.id,
            label: currentSystemType.label || ''
          };
        } else {
          console.log(`PARENT ${index + 1} NOT FOUND:`, selectedField.parent.id);
        }
      } else {
        console.log(`NO PARENT UPDATE ${index + 1}: Parent empty or no systemTypeData`);
      }

      // 2. Update field labels based on source accordion
      if (selectedField.field && selectedField.field.id) {
        const oldLabel = selectedField.field.label;

        // Case 1: Field from firstSystemFieldsData (empty parent)
        if (!selectedField.parent.id) {
          const firstSystemField = firstSystemFieldsMap.get(selectedField.field.id);
          if (firstSystemField) {
            selectedField.field = {
              id: selectedField.field.id,
              label: firstSystemField.label || ''
            };
          } else {
            console.log(`Available keys in firstSystemFieldsMap:`,
              Array.from(firstSystemFieldsMap.keys()));
          }
        }
        // Case 2: Field from systemFieldsAccData (has parent with ID)
        else {
          // Only search systemFieldsAccData if we have the right parent loaded
          const systemField = systemFieldsMap.get(selectedField.field.id);
          if (systemField) {
            selectedField.field = {
              id: selectedField.field.id,
              label: systemField.label || ''
            };
          } else {
            console.log(`Available keys in systemFieldsMap:`,
              Array.from(systemFieldsMap.keys()));
          }
        }
      }

      // 3. Update operator labels based on current language
      if (selectedField.operator && selectedField.operator.id &&
        selectedField.operatorOptions && selectedField.operatorOptions.length > 0) {
        const currentOperator = selectedField.operatorOptions.find(op => op.id === selectedField.operator.id);
        if (currentOperator) {
          selectedField.operator = {
            id: selectedField.operator.id,
            label: currentOperator[this.currentLanguage] || currentOperator.id
          };
        }
      }

      console.log('SELECTED FIELD:', selectedField);
      return selectedField;
    });
    // Save updated fields to localStorage
    this.updateLocalStorage();
  }

  // Enhanced extractFields method with deeper inspection for Case 2
  private extractFields(accordionData: AccordionItem[], fieldsMap: Map<string, any>): void {

    const processSection = (section: AccordionItem) => {

      // 1. First add this section itself if it has an ID (might be a field)
      if (section.id && section.label) {
        fieldsMap.set(section.id, { id: section.id, label: section.label });
      }

      // 2. Process children
      if (section.children && Array.isArray(section.children)) {
        section.children.forEach(child => {
          // Add the child itself as a field 
          if (child.id) {
            fieldsMap.set(child.id, { id: child.id, label: child.label });

            // If it has children, process them recursively
            if (child.children && child.children.length > 0) {
              processSection(child);
            }
          }
        });
      } else {
        console.log('NO CHILDREN in this section');
      }

      // 3. Also check for explicit fields array if it exists (for flexibility)
      if (section['fields'] && Array.isArray(section['fields'])) {
        section['fields'].forEach(field => {
          fieldsMap.set(field.id, field);
        });
      }
    };

    // Process all top-level sections
    accordionData.forEach(section => processSection(section));
  }

  // Add a method to track all system type IDs used in selected fields
  private getAllSelectedSystemTypeIds(): string[] {
    const uniqueIds = new Set<string>();

    // Extract all unique parent IDs from selected fields that aren't empty
    this.selectedFields.forEach(field => {
      if (field.parent && field.parent.id) {
        uniqueIds.add(field.parent.id);
      }
    });

    return Array.from(uniqueIds);
  }

  // Add a method to load data for all system types used in selected fields
  loadAllUsedSystemFields(systemTypeIds: string[]): void {
    if (systemTypeIds.length === 0) {
      return;
    }
    // Keep track of how many loads are pending
    let pendingLoads = systemTypeIds.length;

    // Set loading state
    this.loadingSubject.next(true);
    this.hasError = false;

    // Create a map to collect all loaded fields - but don't display them
    const temporarySystemFields: AccordionItem[] = [];
    const systemFieldsMap = new Map<string, any>();

    // For each system type ID, load its fields
    systemTypeIds.forEach(systemTypeId => {
      this.searchService.getSystemFieldsAccData(systemTypeId, this.currentLanguage)
        .pipe(
          takeUntil(this.destroy$),
          catchError(err => {
            console.error(`Error loading fields for system type ${systemTypeId}:`, err);
            return of([]);
          })
        )
        .subscribe({
          next: (fields) => {
            // Add these fields to our collection
            temporarySystemFields.push(...fields);
          },
          complete: () => {
            pendingLoads--;

            // Once all are loaded, extract fields and update labels, but don't update systemFieldsAccData
            if (pendingLoads === 0) {
              // Extract all fields from temporary data
              this.extractFields(temporarySystemFields, systemFieldsMap);

              // Update selected fields with the map data
              this.updateSelectedFieldLabels(systemFieldsMap);

              // Complete loading state
              this.loadingSubject.next(false);

              // DO NOT update systemFieldsAccData here - this was the bug
            }
          }
        });
    });
  }

  // 2. Add a new method specifically for updating field labels without affecting the UI
  // Update field labels without affecting UI
  updateSelectedFieldLabels(systemFieldsMap: Map<string, any>): void {
    // Prepare a map of all fields from firstSystemFieldsData for quick lookup
    const firstSystemFieldsMap = new Map();
    this.extractFields(this.firstSystemFieldsData, firstSystemFieldsMap);

    // Loop through each selectedField and update labels efficiently
    this.selectedFields = this.selectedFields.map((selectedField, index) => {
      // 1. Update parent labels if we have systemTypeData
      if (selectedField.parent && selectedField.parent.id && this.systemTypeData.length > 0) {
        const currentSystemType = this.systemTypeData.find(item => item.id === selectedField.parent.id);
        if (currentSystemType) {
          selectedField.parent = {
            id: selectedField.parent.id,
            label: currentSystemType.label || ''
          };
        }
      }

      // 2. Update field labels based on source accordion
      if (selectedField.field && selectedField.field.id) {
        // Case 1: Field from firstSystemFieldsData (empty parent)
        if (!selectedField.parent.id) {
          const firstSystemField = firstSystemFieldsMap.get(selectedField.field.id);
          if (firstSystemField) {
            selectedField.field = {
              id: selectedField.field.id,
              label: firstSystemField.label || ''
            };
          }
        }
        // Case 2: Field from systemFieldsAccData (has parent with ID)
        else {
          // Use the provided map instead of systemFieldsAccData
          const systemField = systemFieldsMap.get(selectedField.field.id);
          if (systemField) {
            selectedField.field = {
              id: selectedField.field.id,
              label: systemField.label || ''
            };
          }
        }
      }

      // 3. Update operator labels based on current language
      if (selectedField.operator && selectedField.operator.id &&
        selectedField.operatorOptions && selectedField.operatorOptions.length > 0) {
        const currentOperator = selectedField.operatorOptions.find(op => op.id === selectedField.operator.id);
        if (currentOperator) {
          selectedField.operator = {
            id: selectedField.operator.id,
            label: currentOperator[this.currentLanguage] || currentOperator.id
          };
        }
      }

      return selectedField;
    });

    // Save updated fields to localStorage
    this.updateLocalStorage();
  }

  // Use existing field type mappings for a cleaner implementation
  restoreValueFormat(criteria: SearchCriteria[]): SelectedField[] {
    return criteria.map(item => {
      // Get the value to process
      let value = item.value;
      const operatorId = item.operator?.id?.toLowerCase() || '';
      const fieldId = item.field?.id || '';

      // Use FieldTypeMapping to determine the field type
      const fieldType = FieldTypeMapping[fieldId] || FieldType.Text; // Default to Text if not found

      // Check if this operator typically uses dual values
      const isDualOperator = DualOperators.includes(operatorId as OperatorType);

      // If it's a string containing hyphens and it should be an array
      if (typeof value === 'string' && value.includes('-') && isDualOperator) {
        // Split by hyphen to get the array back
        const splitValues = value.split('-');

        // Handle based on field type
        switch (fieldType) {
          case FieldType.Date:
            // Format dates properly for HTML date input
            value = splitValues.map(dateStr => {
              try {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                  return this.formatDateForInput(date);
                }
              } catch (e) {
                console.error('Error formatting date:', e);
              }
              return dateStr;
            });
            break;

          case FieldType.Dropdown:
            // For dropdown fields, we might need to reconstruct objects from their IDs
            // This depends on how your dropdown component expects values
            // For now, we'll just keep the split values
            value = splitValues;
            break;

          default:
            // For other field types, just use the split array
            value = splitValues;
        }
      }
      // Handle non-array values based on field type
      else if (typeof value === 'string' && !isDualOperator) {
        switch (fieldType) {
          case FieldType.Date:
            // Format single date for HTML date input
            try {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                value = this.formatDateForInput(date);
              }
            } catch (e) {
              console.error('Error formatting date:', e);
            }
            break;

          // Other field types may need special handling here
        }
      }

      // Get operator options for this field
      const operatorOptions = this.getOperatorOptions(item.field.id);

      // Reconstruct the field structure
      return {
        parent: item.parent || { id: '', label: '' },
        field: item.field,
        operator: item.operator,
        operatorOptions: operatorOptions,
        value: value,
        // Initialize touched states
        parentTouched: false,
        operatorTouched: false,
        valueTouched: false
      } as SelectedField;
    });
  }

  // Helper method to format dates for HTML date input (YYYY-MM-DD format)
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadSavedSearchCriteria(): void {
    // this.searchService.getSavedSearchCriteria()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (criteria) => {
    //       // Restore proper value formats for arrays
    //       this.selectedFields = this.restoreValueFormat(criteria);
    //     },
    //     error: (error) => {
    //       console.error('Error loading saved search criteria:', error);
    //     }
    //   });
  }
}
