import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FieldType, FieldTypeMapping, NumericFieldMapping, StringFieldMapping, DateFieldMapping, DropdownFieldMapping } from '../../enums/field-types.enum';
import { OperatorType, NoValueOperators, DualOperators } from '../../enums/operator-types.enum';
import { SelectedField } from '../../interfaces/selectedFields.interface';
import { SearchService } from '../../services/search.service';
import { DropdownItem } from '../../interfaces/table-dropdown.interface';
import { LanguageService } from '../../services/language.service';
import { Subject, takeUntil } from 'rxjs';
import { SearchCriteria } from '../../interfaces/search-criteria.interface';

@Component({
  selector: 'app-query-table',
  standalone: false,
  templateUrl: './query-table.component.html',
  styleUrl: './query-table.component.scss'
})
export class QueryTableComponent implements OnInit, OnDestroy {
  // Add a destroy subject for subscription cleanup
  private destroy$ = new Subject<void>();

  @Input() selectedFields: SelectedField[] = [];
  @Input() dropdownData: any;
  @Input() selectedLanguage: string = 'de';
  @Output() operatorChange = new EventEmitter<{ newOperator: string, index: number }>();
  @Output() searchSelectedField = new EventEmitter<SelectedField>();
  @Output() deleteSelectedField = new EventEmitter<number>();

  // System type data for parent dropdown
  systemTypeData: DropdownItem[] = [];
  isLoadingSystemTypes: boolean = false;
  selectedListValue: DropdownItem | DropdownItem[] | null = null;
  selectedValueIds: string[] = [];

  // Global flag to indicate the user has attempted to submit.
  submitted: boolean = false;

  FieldType = FieldType; // Add this line to make FieldType accessible in the template

  // Map to store localized parent labels
  private parentLabelMap: Map<string, { [lang: string]: string }> = new Map();

  constructor(private searchService: SearchService, private languageService: LanguageService) { }

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageService.language$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        this.selectedLanguage = lang;
        this.loadSystemTypeFields(this.selectedLanguage);
        // Update parent labels for non-dropdown cases
        this.updateParentLabels();
        // Update parentSelected labels for dropdown cases
        this.updateParentSelectedLabels();
      });

    // Initialize parentSelected for each row if not already set
    this.selectedFields.forEach(field => {
      if (this.isParentEmpty(field) && !field.parentSelected) {
        field.parentSelected = null;
      }
    });
    this.loadSelectedValuesFromStorage();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSystemTypeFields(lang: string): void {
    this.isLoadingSystemTypes = true;
    this.searchService.getSystemTypeFieldsByLang(lang)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fields) => {
          this.systemTypeData = fields;
          this.isLoadingSystemTypes = false;
          // Store all available labels for each parent ID
          this.updateParentLabelMap(fields);
          // Update parent labels based on new data
          this.updateParentLabels();
        },
        error: (error) => {
          console.error('Error loading system types:', error);
          this.isLoadingSystemTypes = false;
        }
      });
  }

  // Create a map of parent IDs to their labels in different languages
  private updateParentLabelMap(data: DropdownItem[]): void {
    data.forEach(item => {
      if (!this.parentLabelMap.has(item.id)) {
        this.parentLabelMap.set(item.id, {});
      }

      const labelMap = this.parentLabelMap.get(item.id);
      if (labelMap && item.label !== undefined) {
        // Add a null check to ensure item.label is defined
        labelMap[this.selectedLanguage] = item.label;
      }
    });
  }

  // Update parent labels based on the current language
  private updateParentLabels(): void {
    this.selectedFields.forEach(field => {
      if (field.parent && field.parent.id) {
        const labelMap = this.parentLabelMap.get(field.parent.id);
        if (labelMap && labelMap[this.selectedLanguage]) {
          // Update the label to the localized version
          field.parent.label = labelMap[this.selectedLanguage];
        }
      }
    });
  }

  // Check if parent should show dropdown (renamed to be clearer)
  isParentEmpty(selected: SelectedField): boolean {
    // Show dropdown when parent is empty or null
    return !selected.parent || !selected.parent.id;
  }

  onSelectedListValueChange(selectedValues: DropdownItem[]): void {
    this.selectedListValue = selectedValues.length === 1 ? selectedValues[0] : selectedValues;
    this.updateSelectedValueIds();
    this.saveSelectedValuesToStorage(this.selectedListValue);
  }

  // Load selected values from localStorage
  loadSelectedValuesFromStorage(): void {
    // Load list values
    const savedListValue = localStorage.getItem('selectedListValue');
    if (savedListValue) {
      try {
        this.selectedListValue = JSON.parse(savedListValue);
        this.updateSelectedValueIds();
      } catch (e) {
        console.error('Error parsing saved list values', e);
        this.selectedListValue = null;
        this.selectedValueIds = [];
      }
    }
  }

  // Update selectedValueIds from selectedListValue 
  updateSelectedValueIds(): void {
    if (!this.selectedListValue) {
      this.selectedValueIds = [];
      return;
    }

    if (Array.isArray(this.selectedListValue)) {
      this.selectedValueIds = this.selectedListValue.map(item => item.id);
    } else {
      this.selectedValueIds = [this.selectedListValue.id];
    }
  }

  // Save selected values to localStorage
  saveSelectedValuesToStorage(selectedValues: DropdownItem | DropdownItem[]): void {
    localStorage.setItem('selectedListValue', JSON.stringify(selectedValues));
  }

  // Get selected values for specific row
  getParentSelectedValues(selected: SelectedField, rowIndex: number): string[] {
    if (!selected.parentSelected) {
      return [];
    }

    if (Array.isArray(selected.parentSelected)) {
      return selected.parentSelected.map(item => item.id);
    } else if (selected.parentSelected) {
      return [selected.parentSelected.id];
    }

    return [];
  }


  // Handle parent value change for specific row
  onParentValueChange(selectedValues: DropdownItem[], rowIndex: number): void {
    if (!this.selectedFields[rowIndex]) return;

    // Store selection for this specific row without modifying parent
    this.selectedFields[rowIndex].parentSelected = selectedValues.length > 0 ? selectedValues : null;

    // Save to local storage if needed
    this.saveToLocalStorage();
  }
  // Helper method to save changes
  private saveToLocalStorage(): void {
    localStorage.setItem('selectedFields', JSON.stringify(this.selectedFields));
  }

  // Get selected parent items as array for display
  getSelectedParentItems(selected: SelectedField): DropdownItem[] {
    if (!selected.parentSelected) {
      return [];
    }

    if (Array.isArray(selected.parentSelected)) {
      return selected.parentSelected;
    } else if (selected.parentSelected) {
      return [selected.parentSelected];
    }

    return [];
  }
  onOperatorChange(newOperator: string, index: number): void {
    this.operatorChange.emit({ newOperator, index });
    this.selectedFields[index].operatorTouched = true;

    // Initialize value when operator changes
    this.initializeValue(this.selectedFields[index]);
  }

  // Initialize value based on control type (single or dual)
  initializeValue(selected: SelectedField): void {
    const control = this.getValueControl(selected);

    if (control.dual && (!selected.value || !Array.isArray(selected.value))) {
      // Initialize dual input values as array with empty strings
      selected.value = ['', ''];
    } else if (!control.dual && Array.isArray(selected.value)) {
      // Convert array back to single value if control type changed
      selected.value = selected.value[0] || '';
    } else if (!control.dual && selected.value === undefined) {
      // Initialize single input with empty string
      selected.value = '';
    }
  }

  // Helper method to get parent data for search/save operations
  prepareParentDataForSearch(index: number): any {
    const selected = this.selectedFields[index];
    if (selected && selected.parentSelected) {
      let firstSelected: DropdownItem;

      // Handle both array and non-array cases
      if (Array.isArray(selected.parentSelected)) {
        if (selected.parentSelected.length === 0) return { id: '', label: '' };
        firstSelected = selected.parentSelected[0];
      } else {
        // It's a single DropdownItem
        firstSelected = selected.parentSelected;
      }

      // Return prepared data without modifying the original object
      return {
        id: firstSelected.id,
        label: firstSelected.label || ''
      };
    }
    return { id: '', label: '' }; // Empty parent
  }

  // Then use this in your search or save methods
  // Update the onSearchSelectedField method to include all parent selections
  onSearchSelectedField(selected: SelectedField): void {
    // Emit the search criteria
    this.searchSelectedField.emit(selected);
  }

  onDeleteSelectedField(index: number): void {
    this.deleteSelectedField.emit(index);
  }

  getFieldType(selected: SelectedField): FieldType {
    return FieldTypeMapping[selected.field.id.toLowerCase()] || FieldType.Text;
  }

  getValueControl(selected: SelectedField): any {
    const control = { show: false, dual: false, type: FieldType.Text }; // Default control

    // Only show controls if a valid operator is selected (not 'select')
    // Explicitly check for 'select' option
    if (!selected.operator?.id || selected.operator.id === 'select') {
      control.show = false;
      return control;
    }

    const operatorId = selected.operator.id.toLowerCase();

    // Scenario-1: No need to display any control
    if (NoValueOperators.includes(operatorId as OperatorType)) {
      control.show = false;
      return control;
    }

    // Check the parent column set
    const parentType = this.getFieldType(selected);

    // Scenario-2: Handle dual controls for specific operations
    if (DualOperators.includes(operatorId as OperatorType)) {
      control.show = true;
      control.dual = true;
      control.type = this.getControlType(parentType);
      return control;
    }

    // Scenario-3: Handle single controls for other operations
    control.show = true;
    control.type = this.getControlType(parentType);

    return control;
  }

  private getControlType(parentType: FieldType): FieldType {
    switch (parentType) {
      case FieldType.Date:
        return FieldType.Date;
      case FieldType.Number:
        return FieldType.Number;
      case FieldType.Dropdown:
        return FieldType.Dropdown;
      default:
        return FieldType.Text;
    }
  }

  isOperatorValid(selected: SelectedField): boolean {
    return !!selected.operator?.id && selected.operator.id !== 'select';
  }

  validateField(selected: SelectedField, idx?: number): boolean {
    const control = this.getValueControl(selected);
    if (!control.show) {
      return true;
    }

    // Initialize value if not set
    if (control.dual && (!selected.value || !Array.isArray(selected.value))) {
      selected.value = ['', ''];
    }

    let value;
    if (control.dual) {
      // For dual controls, validate specific index if provided
      if (idx !== undefined) {
        value = selected.value[idx];
        return this.validateSingleValue(value, control.type);
      }
      // Otherwise validate both values
      return this.validateSingleValue(selected.value[0], control.type) &&
        this.validateSingleValue(selected.value[1], control.type);
    } else {
      // For single controls
      value = selected.value;
      return this.validateSingleValue(value, control.type);
    }
  }

  // Helper method for validating a single value
  private validateSingleValue(value: any, type: FieldType): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    if (typeof value === 'string') {
      value = value.trim();
      if (value === '') return false;
    }

    switch (type) {
      case FieldType.Number:
        return /^[0-9]+$/.test(value.toString());
      case FieldType.Text:
        return value.toString().length > 0;
      case FieldType.Date:
        return value !== '';
      case FieldType.Dropdown:
        return value !== null && value !== '';
      default:
        return true;
    }
  }

  markValueTouched(selected: SelectedField, idx?: number): void {
    const control = this.getValueControl(selected);

    if (control.dual && idx !== undefined) {
      // For dual inputs, we need an array of booleans
      if (!selected.valueTouched || typeof selected.valueTouched === 'boolean') {
        // Initialize as array if it doesn't exist or is a boolean
        selected.valueTouched = [false, false];
      }
      // Now we can safely set the specific index
      (selected.valueTouched as boolean[])[idx] = true;
    } else {
      // For single inputs, just set to true
      selected.valueTouched = true;
    }
  }

  // Helper method to check if a value is touched
  isValueTouched(selected: SelectedField, idx?: number): boolean {
    if (!selected.valueTouched) return false;

    if (Array.isArray(selected.valueTouched) && idx !== undefined) {
      return !!selected.valueTouched[idx];
    }

    return !!selected.valueTouched;
  }

  shouldShowValueColumn(): boolean {
    return this.selectedFields.some(field =>
      this.getValueControl(field).show && this.isOperatorValid(field)
    );
  }

  // Add these methods to handle dropdown value storage and retrieval
  getSelectedDropdownValues(selected: SelectedField): string[] {
    if (!selected.value) return [];

    // If the value is already an object with id, extract the id
    if (typeof selected.value === 'object' && selected.value !== null && 'id' in selected.value) {
      return [selected.value.id];
    }

    // If it's an array of objects, map to ids
    if (Array.isArray(selected.value) && selected.value.length > 0 &&
      typeof selected.value[0] === 'object' && 'id' in selected.value[0]) {
      return selected.value.map(item => item.id);
    }

    // If it's a simple string, wrap in array
    if (typeof selected.value === 'string') {
      return [selected.value];
    }

    return [];
  }

  onDropdownValueChange(selectedItems: any[], index: number): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.selectedFields[index].value = null;
    } else if (selectedItems.length === 1) {
      // Store the complete object to preserve language information
      this.selectedFields[index].value = selectedItems[0];
    } else {
      // Store array of objects for multi-select
      this.selectedFields[index].value = selectedItems;
    }

    // Mark as touched to handle validation
    this.markValueTouched(this.selectedFields[index]);
  }

  // Update parentSelected labels based on the current language
  private updateParentSelectedLabels(): void {
    this.selectedFields.forEach(field => {
      if (!field.parentSelected) return;

      // Handle both single and array cases
      if (Array.isArray(field.parentSelected)) {
        field.parentSelected.forEach(item => {
          const labelMap = this.parentLabelMap.get(item.id);
          if (labelMap && labelMap[this.selectedLanguage]) {
            // Update the label to the localized version
            item.label = labelMap[this.selectedLanguage];
          }
        });
      } else {
        // Single item case
        const labelMap = this.parentLabelMap.get(field.parentSelected.id);
        if (labelMap && labelMap[this.selectedLanguage]) {
          // Update the label to the localized version
          field.parentSelected.label = labelMap[this.selectedLanguage];
        }
      }
    });
  }
}