import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccordionItem } from '../../../interfaces/accordian-list.interface';
import { DropdownItem } from '../../../interfaces/table-dropdown.interface';
import { SelectedField } from '../../../interfaces/selectedFields.interface';
import { SearchRequest } from '../../../interfaces/search-request.interface';
import { SearchCriteria } from '../../../interfaces/search-criteria.interface';
import { SearchService } from '../../../services/search.service';
import { LanguageService } from '../../../services/language.service';
import { StorageService } from './services/storage.service';
import { FieldService } from './services/field.service';
import { SelectionService } from './services/selection.service';
import { SearchCriteriaService } from './services/search-criteria.service';
import { StateManagementService } from './services/state-management.service';
import { trackByFn, getAllSelectedSystemTypeIds, isFieldValid } from './utils/search-utils';
import { SearchAccordionService } from './services/search-accordion.service';
import { AccordionSectionComponent } from '../../accordionControl/accordion-section/accordion-section.component';
import { updatedSearchGroupFields } from '../../../common/updatedsearch_groupfields';
import { TableDropdownComponent } from '../../dropdownControl/table-dropdown/table-dropdown.component';

@Component({
  selector: 'app-select-search',
  standalone: false,
  templateUrl: './select-search.component.html',
  styleUrl: './select-search.component.scss'
})
export class SelectSearchComponent implements OnInit, OnDestroy {
  // Track component lifecycle
  private destroy$ = new Subject<void>();
  private loadingSubject = new Subject<boolean>();

  // ViewChildren to access accordion sections
  @ViewChildren(AccordionSectionComponent) accordionSections!: QueryList<AccordionSectionComponent>;
  @ViewChildren('firstAccordion') firstAccordionSections!: QueryList<AccordionSectionComponent>;
  @ViewChildren('systemAccordion') systemAccordionSections!: QueryList<AccordionSectionComponent>;
  @ViewChild('systemTypeDropdown') systemTypeDropdown!: TableDropdownComponent;
  // Add ViewChild for saved group accordion
  @ViewChild('savedGroupAccordion') savedGroupAccordion: any; // Use specific type if available
  // First System Fields Accordion Data
  public firstSystemFieldsData: AccordionItem[] = [];

  // Loading state management
  public isLoading$ = this.loadingSubject.asObservable();
  public isLoading: boolean = false;
  public loadingSystemTypes: boolean = false;
  public hasError: boolean = false;
  public errorMessage: string = '';

  // System fields accordion data with state tracking
  public systemFieldsAccData: AccordionItem[] = [];

  // For table data fields storage
  public selectedFields: SelectedField[] = [];
  public operationsDDData: any;

  // System type data configuration
  public systemTypeData: DropdownItem[] = [];
  public currentLanguage = 'en';
  public selectedSystemTypeValueIds: string[] = [];
  public selectedSystemTypeValue: DropdownItem | DropdownItem[] | null = null;

  public searchCriteria: SearchCriteria[] = [];

  // UI state management
  public showSaveContainer: boolean = false;
  public isEditMode: boolean = false;
  public isDeleteMode: boolean = false;
  public searchName: string = '';
  public searchNameId: string = '';
  public currentGroupField: SearchRequest | null = null;

  // Saved search groups (from backend or local storage)
  public savedGroupFields = updatedSearchGroupFields;

  // Computed property for group data display
  set showGroupDataOutside(value: boolean) {
    this.stateService.setShowGroupDataOutside(value);
  }

  get showGroupDataOutside(): boolean {
    return this.stateService.getShowGroupDataOutside();
  }

  // Track by function for ngFor performance optimization
  trackByFn = trackByFn;

  constructor(
    private searchService: SearchService,
    private changeDtr: ChangeDetectorRef,
    private languageService: LanguageService,
    private selectionService: SelectionService,
    private fieldService: FieldService,
    private searchCriteriaService: SearchCriteriaService,
    private stateService: StateManagementService,
    private accordionService: SearchAccordionService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageService.language$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        this.currentLanguage = lang;
        this.loadDataForCurrentLanguage();
      });

    // Subscribe to selected fields changes
    this.selectionService.selectedFields$
      .pipe(takeUntil(this.destroy$))
      .subscribe(fields => {
        this.selectedFields = fields;
      });

    // Subscribe to system fields data changes
    this.fieldService.firstSystemFieldsData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.firstSystemFieldsData = data;
      });

    // Subscribe to system fields accordion data changes
    this.fieldService.systemFieldsAccData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.systemFieldsAccData = data;
      });

    // Subscribe to system type data changes
    this.fieldService.systemTypeData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.systemTypeData = data;
      });

    // Subscribe to loading state changes
    this.fieldService.loadingSystemTypes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loadingSystemTypes = loading;
      });

    // Subscribe to field loading state changes
    this.fieldService.loadingFields$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
        this.loadingSubject.next(loading);
      });

    // Subscribe to error state changes
    this.fieldService.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.hasError = error.hasError;
        this.errorMessage = error.message;
      });

    // Subscribe to saved group fields changes
    // this.searchCriteriaService.savedGroupFields$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(groups => {
    //     this.savedGroupFields = groups;
    //     console.log('Saved group fields:', groups);
    //   });

    // Subscribe to system type value changes
    this.stateService.selectedSystemTypeValue$
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.selectedSystemTypeValue = value;
        this.updateSelectedSystemTypeValueIds();
      });

    // Load stored values from localStorage
    this.loadSelectedSystemTypeValuesFromStorage();
  }

  // Update field labels when language changes
  updateFieldLabelsForLanguage(): void {
    // Get maps with the latest data in the current language
    const firstSystemFieldsMap = this.fieldService.getFirstSystemFieldsMap();
    const systemFieldsMap = this.fieldService.getSystemFieldsMap();

    // Update all selected fields with the new language labels
    this.selectionService.updateFieldLabels(
      firstSystemFieldsMap,
      systemFieldsMap,
      this.systemTypeData,
      this.currentLanguage
    );
  }

  // Load data for current language
  loadDataForCurrentLanguage(): void {
    // Load system type fields
    this.fieldService.loadSystemTypeFields(this.currentLanguage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Update selectedSystemTypeValue with the new language labels
          this.updateSelectedSystemTypeLabelsForLanguage();

          // After loading system types, load first accordion data
          this.fieldService.loadFirstAccordionData(this.currentLanguage)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                // Now that we have the first accordion data, update field labels
                this.updateFieldLabelsForLanguage();
              }
            });

          // Load system fields data if we have selected system types
          if (this.selectedSystemTypeValueIds.length > 0) {
            this.fieldService.loadAccordionData(
              this.selectedSystemTypeValueIds,
              this.currentLanguage
            )
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  // Now that we have the system fields data, update field labels again
                  this.updateFieldLabelsForLanguage();
                }
              });
          }
        },
        error: () => {
          this.hasError = true;
          this.errorMessage = 'Failed to load data. Please try again.';
        }
      });
  }

  // Add this new method to update the selectedSystemTypeValue labels
  private updateSelectedSystemTypeLabelsForLanguage(): void {
    if (!this.selectedSystemTypeValue) return;

    // Create a map for quick lookup of new labels
    const systemTypeMap = new Map<string, DropdownItem>();
    this.systemTypeData.forEach(item => systemTypeMap.set(item.id, item));

    if (Array.isArray(this.selectedSystemTypeValue)) {
      // Update the labels for each item in the array
      this.selectedSystemTypeValue = this.selectedSystemTypeValue.map(item => {
        const updatedType = systemTypeMap.get(item.id);
        if (updatedType) {
          return {
            id: item.id,
            label: updatedType.label
          };
        }
        return item;
      });
    } else {
      // Update the label for the single item
      const updatedType = systemTypeMap.get(this.selectedSystemTypeValue.id);
      if (updatedType) {
        this.selectedSystemTypeValue = {
          id: this.selectedSystemTypeValue.id,
          label: updatedType.label
        };
      }
    }

    // Make sure to update the state service too
    this.stateService.setSelectedSystemTypeValue(this.selectedSystemTypeValue);
  }

  // Load selected values from localStorage
  loadSelectedSystemTypeValuesFromStorage(): void {
    this.selectedSystemTypeValue = this.stateService.getSelectedSystemTypeValue();
    this.updateSelectedSystemTypeValueIds();

    // Load fields for the selected system types
    if (this.selectedSystemTypeValueIds.length > 0) {
      this.fieldService.loadAccordionData(this.selectedSystemTypeValueIds, this.currentLanguage)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
  }

  // Update the IDs array based on selected values
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

  // Handle system type selection change - matches the event in HTML
  onSelectedSystemTypeValueChange(event: any): void {
    this.stateService.setSelectedSystemTypeValue(event);
    this.updateSelectedSystemTypeValueIds();

    if (this.selectedSystemTypeValueIds.length > 0) {
      this.fieldService.loadAccordionData(this.selectedSystemTypeValueIds, this.currentLanguage)
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    } else {
      this.fieldService.clearSystemFieldsAccData();
    }
  }

  /**
   * Extract field object from various input formats
   * @param item - The item from which to extract field data
   * @returns Field object or null if invalid
   */
  private extractFieldFromItem(item: any): { id: string, label: string } | null {
    if (!item) return null;

    // Handle different item formats
    if (item.field) {
      return {
        id: item.field.id,
        label: item.field.label
      };
    } else if (item.item) {
      return {
        id: item.item.id,
        label: item.item.label
      };
    } else if (item.id) {
      return {
        id: item.id,
        label: item.label || item.id
      };
    }

    return null;
  }

  /**
   * Extract parent object from system type or event
   * @param event - The event that might contain parent information
   * @returns Parent object
   */
  private getParentObject(event: any = null): { id: string, label: string } {
    // Always use the selected system type as the parent for system fields
    // regardless of what might be in event.parent
    if (this.selectedSystemTypeValue) {
      // Handle both single and multiple selection
      if (Array.isArray(this.selectedSystemTypeValue)) {
        // For multiple selections, use the first one as parent
        if (this.selectedSystemTypeValue.length > 0) {
          const firstItem = this.selectedSystemTypeValue[0];
          return {
            id: firstItem.id || '', // Add fallback for undefined id
            label: firstItem.label || '' // Add fallback for undefined label
          };
        }
      } else {
        // Single system type selection
        return {
          id: this.selectedSystemTypeValue.id || '', // Add fallback for undefined id
          label: this.selectedSystemTypeValue.label || '' // Add fallback for undefined label
        };
      }
    }

    // Default empty parent if no system type selected
    return { id: '', label: '' };
  }
  // Handle accordion item selection from first accordion
  onFirstAccFieldSelected(item: any): void {
    const field = this.extractFieldFromItem(item);
    if (!field) return;

    // First accordion items always have no parent
    const emptyParent = { id: '', label: '' };
    this.isEditMode = false;
    this.selectionService.addField(field, emptyParent, '', this.currentLanguage);
  }

  // Handle accordion item selection from system accordion
  onFieldSelected(event: any): void {
    const field = this.extractFieldFromItem(event);
    if (!field) return;

    // For system fields, get the appropriate parent from the selectedSystemTypeValue
    let parentObj;

    // Use the selectedSystemTypeValue directly as the parent
    // This is the key change - use the actual system type rather than event.parent
    if (this.selectedSystemTypeValue) {
      // Handle both single and multiple selection
      if (Array.isArray(this.selectedSystemTypeValue)) {
        // If multiple system types are selected, use the first one as parent
        if (this.selectedSystemTypeValue.length > 0) {
          const firstItem = this.selectedSystemTypeValue[0];
          parentObj = {
            id: firstItem.id || '', // Add fallback for undefined id
            label: firstItem.label || '' // Add fallback for undefined label
          };
        } else {
          parentObj = { id: '', label: '' };
        }
      } else {
        // Single system type selection
        parentObj = {
          id: this.selectedSystemTypeValue.id || '', // Add fallback for undefined id
          label: this.selectedSystemTypeValue.label || '' // Add fallback for undefined label
        };
      }
    } else {
      // If no system type is selected, use empty parent
      parentObj = { id: '', label: '' };
    }

    this.isEditMode = false;

    this.selectionService.addField(
      field,
      parentObj,
      event?.path || '',
      this.currentLanguage
    );
  }
  // Handle saved field selection
  onSavedFieldSelected(field: SearchCriteria): void {
    if (!field) return;

    // First clear existing fields and table data
    this.selectionService.clearFields();

    this.selectionService.addSavedField(field);
  }

  // Handle saved group field title clicked
  onSavedGroupFieldTitleClicked(groupField: SearchRequest): void {
    this.selectionService.clearFields();

    // Check if the title and title.id exists
    if (groupField.title && groupField.title.id) {
      this.isEditMode = true;
      this.searchName = groupField.title.label;
      this.searchNameId = groupField.title.id;
    } else {
      console.log('Saved group field has no title ID');
    }
    this.selectionService.addSavedGroup(groupField);
  }

  // Handle operator change in relation table
  onOperatorChange(event: any): void {
    if (!event) return;

    // Handle both formats for compatibility
    const index = event.index !== undefined ? event.index : event.rowIndex;
    const operatorId = event.newOperator !== undefined ? event.newOperator : event.operatorId;

    if (index === undefined || operatorId === undefined) {
      console.error('Invalid operator change event format:', event);
      return;
    }

    this.selectionService.updateOperator(index, operatorId, this.currentLanguage);
  }

  // Handle delete field action in relation table
  onDeleteSelectedField(index: number): void {
    this.selectionService.deleteField(index);
  }

  // Handle search action from relation table
  onSearchSelectedField(event: any): void {
    // This would typically trigger field-specific search operations
    // For now, just log the event
    console.log('Search for field', event);
  }

  // Clear the relation table - matches clearTable() in HTML
  clearTable(): void {
    // Clear selected fields in relation table
    this.selectionService.clearFields();

    // Clear accordion selections and state
    this.accordionService.clearAccordionState();

    // Reset all application state
    this.stateService.resetAllState();

    // Update component state to match
    this.selectedSystemTypeValue = null;
    this.selectedSystemTypeValueIds = [];

    // Clear system fields accordion data
    this.fieldService.clearSystemFieldsAccData();

    // Clear localStorage items to ensure persistence across page refreshes
    this.storageService.removeItem('selectedFields');
    this.storageService.removeItem('selectedSystemTypeValues');
    this.storageService.removeItem('savedAccordionState');

    // Clear saved-group-accordion's state
    localStorage.removeItem('savedAccordionState');

    // Force expansion state reset on accordion sections using ViewChildren reference
    if (this.firstAccordionSections) {
      this.firstAccordionSections.forEach(section => section.collapse());
    }
    if (this.systemAccordionSections) {
      this.systemAccordionSections.forEach(section => section.collapse());
    }

    // Reset saved group accordion if it exists
    if (this.savedGroupAccordion) {
      this.savedGroupAccordion.reset();
    }

    // Reset the dropdown component if it exists
    if (this.systemTypeDropdown) {
      this.systemTypeDropdown.reset();
    }

    // Reset any error messages
    this.hasError = false;
    this.errorMessage = '';

    // Force change detection to ensure UI updates immediately
    this.changeDtr.detectChanges();
  }

  // Handle search button click - matches searchTable() in HTML
  searchTable(): void {
    const invalidFields = this.selectedFields.filter(field => !isFieldValid(field));
    if (invalidFields.length > 0) {
      // Show validation error
      this.hasError = true;
      this.errorMessage = 'Please complete all required fields before searching.';
      return;
    }

    // Convert selected fields to search criteria format
    const searchCriteria = this.selectionService.convertSelectedFieldsToSearchCriteria(this.selectedFields);
    this.searchCriteria = searchCriteria;

    // Execute the search via the search service
    this.isLoading = true;
    this.loadingSubject.next(true);
    this.hasError = false;

    // this.searchService.executeSearch(searchCriteria)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (results) => {
    //       // Handle search results
    //       this.isLoading = false;
    //       this.loadingSubject.next(false);
    //       // Emit results or update UI
    //     },
    //     error: () => {
    //       this.isLoading = false;
    //       this.loadingSubject.next(false);
    //       this.hasError = true;
    //       this.errorMessage = 'Search failed. Please try again.';
    //     }
    //   });
  }

  // Handle store button click - matches storeTable() in HTML
  storeTable(): void {
    // Check if there are fields to save
    if (this.selectedFields.length === 0) {
      this.hasError = true;
      this.errorMessage = 'Please add fields before saving.';
      return;
    }
    console.log('Store Table fields:', this.selectedFields, ' and EditMode', this.isEditMode);
    // Show the save container
    this.showSaveContainer = true;
    this.isDeleteMode = false;
    this.searchName = '';
    this.currentGroupField = null;
  }

  // Handle edit group field action
  onEditGroupFieldTitle(groupField: SearchRequest): void {
    this.showSaveContainer = true;
    this.isEditMode = true;
    this.isDeleteMode = false;
    this.searchName = groupField.title.label;
    this.currentGroupField = groupField;
  }

  // Handle delete group field action
  onDeleteGroupFieldTitle(groupField: SearchRequest): void {
    this.showSaveContainer = true;
    this.isDeleteMode = true;
    this.isEditMode = false;
    this.searchName = groupField.title.label;
    this.currentGroupField = groupField;
  }

  // Save the current search
  saveSearch(): void {

    this.saveFreshSearchData(this.searchName);
    this.cancelSave();
  }

  // Add this new method to handle fresh search data saving
  saveFreshSearchData(searchName: string): void {
    // Validate the search name
    if (!searchName || searchName.trim() === '') {
      this.hasError = true;
      this.errorMessage = 'Please enter a name for your search.';
      return;
    }

    // Validate selected fields
    if (this.selectedFields.length === 0) {
      this.hasError = true;
      this.errorMessage = 'Please add fields before saving.';
      return;
    }

    // Step 1: Convert selectedFields to searchCriteria
    const searchCriteria = this.selectionService.convertSelectedFieldsToSearchCriteria(this.selectedFields);

    // Step 2: Create a searchRequest object with the criteria
    const searchRequest: SearchRequest = {
      title: {
        id: '',
        label: searchName.trim()
      },
      fields: searchCriteria
    };

    // Step 3: Save the search request
    this.saveSearchRequest(searchRequest);
  }

  // Helper method to save the search request (e.g., to backend API)
  private saveSearchRequest(searchRequest: SearchRequest): void {
    // Show loading state
    // this.isLoading = true;
    // this.loadingSubject.next(true);
    console.log('Save search request:', searchRequest);

    // Example API call with FormData (implement as needed)
    // const formData = new FormData();
    // formData.append('searchRequest', JSON.stringify(searchRequest));

    // Call your search service API
    // this.searchService.saveSearchRequest(formData)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (response) => {
    //       // Handle successful save
    //       this.isLoading = false;
    //       this.loadingSubject.next(false);
    //       this.cancelSave();
    //       
    //       // Update saved groups list
    //       this.savedGroupFields = [...this.savedGroupFields, searchRequest];
    //     },
    //     error: (error) => {
    //       this.isLoading = false;
    //       this.loadingSubject.next(false);
    //       this.hasError = true;
    //       this.errorMessage = 'Failed to save search. Please try again.';
    //     }
    //   });

    // For now, use the existing searchCriteriaService to save locally
    this.searchCriteriaService.saveCustomSearchRequest(searchRequest);
    this.cancelSave();
  }

  // Save as a new search
  saveAsSearch(): void {
    if (!this.searchName || this.searchName.trim() === '') {
      this.hasError = true;
      this.errorMessage = 'Please enter a name for your search.';
      return;
    }

    // Always save as a new search, regardless of current mode
    this.searchCriteriaService.saveSearchGroup(this.searchName);
    this.cancelSave();
  }

  // Confirm delete operation
  confirmDelete(): void {
    // Delete the current group field
    if (this.currentGroupField) {
      this.searchCriteriaService.deleteSearchGroup(this.currentGroupField);
    }

    // Reset the UI state
    this.cancelSave();
  }

  // Cancel save/edit/delete operation
  cancelSave(): void {
    // Reset all state variables
    this.showSaveContainer = false;
    this.isEditMode = false;
    this.isDeleteMode = false;
    this.searchName = '';
    this.currentGroupField = null;
    this.hasError = false;
    this.errorMessage = '';
  }

  // Clean up and prevent memory leaks
  ngOnDestroy(): void {
    // Complete all subjects
    this.destroy$.next();
    this.destroy$.complete();
    this.loadingSubject.complete();
  }
}