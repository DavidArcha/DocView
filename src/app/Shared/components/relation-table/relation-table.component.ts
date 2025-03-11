import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SelectedField } from '../../interfaces/selectedFields.interface';
import { DualOperators, NoValueOperators, OperatorType } from '../../enums/operator-types.enum';
import { DropdownDataMapping, FieldType, FieldTypeMapping } from '../../enums/field-types.enum';
import { DropdownItem } from '../../interfaces/table-dropdown.interface';
import { SearchService } from '../../services/search.service';
import { LanguageService } from '../../services/language.service';
import { SearchCriteria } from '../../interfaces/search-criteria.interface';

@Component({
  selector: 'app-relation-table',
  standalone: false,
  templateUrl: './relation-table.component.html',
  styleUrl: './relation-table.component.scss'
})
export class RelationTableComponent implements OnInit, OnDestroy {

  // Add a destroy subject for subscription cleanup
  private destroy$ = new Subject<void>();
  @Input() selectedFields: SelectedField[] = [];
  @Input() dropdownData: any;
  @Input() selectedLanguage: string = 'de';
  @Output() operatorChange = new EventEmitter<{ newOperator: string, index: number }>();
  @Output() searchSelectedField = new EventEmitter<SelectedField>();
  @Output() deleteSelectedField = new EventEmitter<number>();

  systemTypeData: DropdownItem[] = [];
  brandData: DropdownItem[] = [];
  stateData: DropdownItem[] = [];
  FieldType = FieldType; // Add this line to make FieldType accessible in the template

  constructor(private searchService: SearchService, private languageService: LanguageService) { }

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageService.language$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        this.selectedLanguage = lang;
        this.loadSystemTypeFields(this.selectedLanguage);
        this.getBrandData(this.selectedLanguage);
        this.getStateData(this.selectedLanguage);
      });

    // Initialize parentSelected for each row if not already set
    this.selectedFields.forEach(field => {
      if (this.isParentEmpty(field) && !field.parentSelected) {
        field.parentSelected = null;
      }
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Add these methods to handle dropdowns
  getBrandData(lang: any): void {
    this.searchService.getBrandsData(lang)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.brandData = data;
        },
        error: (error) => {
          console.error('Error loading brands:', error);
        }
      });  // Return the data immediately
  }

  getStateData(lang: any): void {
    this.searchService.getStateData(lang)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stateData = data;
        },
        error: (error) => {
          console.error('Error loading states:', error);
        }
      });
  }


  shouldShowValueColumn(): boolean {
    return this.selectedFields.some(field =>
      this.getValueControl(field).show && this.isOperatorValid(field)
    );
  }

  getValueControl(selected: SelectedField): any {
    const control = {
      show: false,
      dual: false,
      type: FieldType.Text,
      dropdownData: [] as DropdownItem[],
      // Add these properties for similar operator handling
      isSimilar: false,
      similarDropdownData: [] as DropdownItem[]
    };

    // Only show controls if a valid operator is selected (not 'select')
    if (!selected.operator?.id || selected.operator.id === 'select') {
      control.show = false;
      return control;
    }

    const operatorId = selected.operator.id.toLowerCase();
    console.log(`Operator ID: ${operatorId}`);

    // Scenario-1: No need to display any control
    if (NoValueOperators.includes(operatorId as OperatorType)) {
      control.show = false;
      return control;
    }

    // Check the parent column set
    const parentType = this.getFieldType(selected);

    // Special case for "similar" operator
    if (operatorId === 'similar') {
      control.show = true;
      control.isSimilar = true; // Mark as similar for special handling in template
      control.type = this.getControlType(parentType);

      // Always load brand data for the similar dropdown
      control.similarDropdownData = this.brandData;

      // If the main control is dropdown, determine which dropdown data to use
      if (control.type === FieldType.Dropdown) {
        control.dropdownData = this.getDropdownDataForField(selected.field.id);
      }

      return control;
    }
    // Continue with existing scenarios

    // Scenario-2: Handle dual controls for specific operations
    if (DualOperators.includes(operatorId as OperatorType)) {
      control.show = true;
      control.dual = true;
      control.type = this.getControlType(parentType);

      // If dropdown field, determine which dropdown data to use
      if (control.type === FieldType.Dropdown) {
        control.dropdownData = this.getDropdownDataForField(selected.field.id);
      }

      return control;
    }

    // Scenario-3: Handle single controls for other operations
    control.show = true;
    control.type = this.getControlType(parentType);

    // If dropdown field, determine which dropdown data to use
    if (control.type === FieldType.Dropdown) {
      control.dropdownData = this.getDropdownDataForField(selected.field.id);
    }

    return control;
  }

  // Add this method to determine which dropdown data to use for a field
  getDropdownDataForField(fieldId: string): any[] {
    // Get data source name from mapping
    const dataSource = DropdownDataMapping[fieldId] || DropdownDataMapping['default'];

    console.log(`Getting dropdown data for field: ${fieldId}, data source: ${dataSource}`);

    // Return the appropriate data based on data source name
    switch (dataSource) {
      case 'brandData':
        return this.brandData;
      case 'stateData':
        return this.stateData;
      // Add more cases as you add more data sources
      default:
        console.warn(`No data source found for ${dataSource}, returning empty array`);
        return [];
    }
  }

  private getControlType(parentType: FieldType): FieldType {
    switch (parentType) {
      case FieldType.Date:
        return FieldType.Date;
      case FieldType.Number:
        return FieldType.Number;
      case FieldType.Dropdown:
        return FieldType.Dropdown;
      case FieldType.Button:
        return FieldType.Button;
      default:
        return FieldType.Text;
    }
  }

  isOperatorValid(selected: SelectedField): boolean {
    return !!selected.operator?.id && selected.operator.id !== 'select';
  }

  getFieldType(selected: SelectedField): FieldType {
    return FieldTypeMapping[selected.field.id] || FieldType.Text;
  }


  // Check if parent should show dropdown (renamed to be clearer)
  isParentEmpty(selected: SelectedField): boolean {
    // Show dropdown when parent is empty or null
    return !selected.parent || !selected.parent.id;
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
  // Handle parent value change for specific row
  onParentValueChange(selectedValues: DropdownItem[], rowIndex: number): void {
    if (!this.selectedFields[rowIndex]) return;

    // Store selection for this specific row without modifying parent
    this.selectedFields[rowIndex].parentSelected = selectedValues.length > 0 ? selectedValues : null;

    // Mark parent as touched for validation
    this.selectedFields[rowIndex].parentTouched = true;

    // Save to local storage if needed
    this.saveToLocalStorage();
  }
  // Helper method to save changes
  private saveToLocalStorage(): void {
    localStorage.setItem('selectedFields', JSON.stringify(this.selectedFields));
  }

  loadSystemTypeFields(lang: string): void {
    this.searchService.getSystemTypeFieldsByLang(lang)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fields) => {
          this.systemTypeData = fields;
          // Update parentSelected values when language changes
          this.updateParentSelectedForLanguageChange(fields);
        },
        error: (error) => {
          console.error('Error loading system types:', error);
        }
      });
  }

  // Add this new method to update parentSelected when language changes
  private updateParentSelectedForLanguageChange(newSystemTypeData: DropdownItem[]): void {
    // Create lookup map for quick access to new system type data by ID
    const systemTypeMap = new Map<string, DropdownItem>();
    newSystemTypeData.forEach(item => systemTypeMap.set(item.id, item));

    // Update each selected field's parentSelected with new language values
    this.selectedFields.forEach(field => {
      if (field.parentSelected) {
        if (Array.isArray(field.parentSelected)) {
          // Update each item in the array with the new language label
          field.parentSelected = field.parentSelected.map(item => {
            const updatedItem = systemTypeMap.get(item.id);
            return updatedItem || item; // Keep original if not found
          });
        } else {
          // Update single item
          const updatedItem = systemTypeMap.get(field.parentSelected.id);
          if (updatedItem) {
            field.parentSelected = updatedItem;
          }
        }
      }
    });

    // Save the updated selections to local storage
    this.saveToLocalStorage();
  }

  // Add these methods to handle field validations

  // Check if parent is valid (either has a parent or parentSelected is chosen)
  isParentValid(selected: SelectedField): boolean {
    // Valid if it has a parent with ID
    if (selected.parent && selected.parent.id) {
      return true;
    }

    // Valid if parentSelected has been chosen
    if (selected.parentSelected) {
      if (Array.isArray(selected.parentSelected)) {
        return selected.parentSelected.length > 0;
      }
      return !!selected.parentSelected.id;
    }

    return false;
  }

  // Check if value is valid based on current operator
  isValueValid(selected: SelectedField): boolean {
    // No validation needed if operator doesn't require a value
    const operatorId = selected.operator?.id?.toLowerCase() || '';
    if (!operatorId || operatorId === 'select' || NoValueOperators.includes(operatorId as OperatorType)) {
      return true;
    }

    // Special validation for similar operator
    if (operatorId === 'similar') {
      return Array.isArray(selected.value) &&
        selected.value.length === 2 &&
        !!selected.value[0] &&  // First part must have a value
        !!selected.value[1];    // Brand selection must have a value
    }

    // Get field type
    const fieldType = this.getFieldType(selected);

    // Special handling for Button type
    if (fieldType === FieldType.Button) {
      // For dual operators with buttons
      if (DualOperators.includes(operatorId as OperatorType)) {
        return Array.isArray(selected.value) &&
          selected.value.length === 2 &&
          !!selected.value[0] &&
          !!selected.value[1];
      }

      // For single button - check if value is not empty/null
      return !!selected.value;
    }

    // Check for dual value operators
    if (DualOperators.includes(operatorId as OperatorType)) {
      // Must have an array with both values
      if (!Array.isArray(selected.value) || selected.value.length !== 2) {
        return false;
      }

      // For number fields, ensure both values are valid numbers
      if (fieldType === FieldType.Number) {
        return selected.value[0] !== undefined &&
          selected.value[0] !== null &&
          selected.value[0] !== '' &&
          !isNaN(Number(selected.value[0])) &&
          selected.value[1] !== undefined &&
          selected.value[1] !== null &&
          selected.value[1] !== '' &&
          !isNaN(Number(selected.value[1]));
      }

      // For dropdown fields, check both values are selected
      if (fieldType === FieldType.Dropdown) {
        return !!selected.value[0] && !!selected.value[1];
      }

      // For other field types, just check they're not empty
      return selected.value[0] !== undefined &&
        selected.value[0] !== null &&
        selected.value[0] !== '' &&
        selected.value[1] !== undefined &&
        selected.value[1] !== null &&
        selected.value[1] !== '';
    }

    // For number fields, ensure value is a valid number
    if (fieldType === FieldType.Number) {
      return selected.value !== undefined &&
        selected.value !== null &&
        selected.value !== '' &&
        !isNaN(Number(selected.value));
    }

    // For dropdown fields, check value exists
    if (fieldType === FieldType.Dropdown) {
      return !!selected.value;
    }

    // For other fields, just check that value exists
    return selected.value !== undefined &&
      selected.value !== null &&
      selected.value !== '';
  }

  // Initialize the values properly for each field based on operator type
  // Initialize the values properly for each field based on operator type
  initializeValueForOperator(selected: SelectedField): void {
    const operatorId = selected.operator?.id?.toLowerCase() || '';

    // Special handling for similar operator
    if (operatorId === 'similar') {
      // For similar, we need two values: main value and brand selection
      if (!selected.value || !Array.isArray(selected.value)) {
        selected.value = ['', null]; // First item for text/number/etc., second for brand selection
      }
      return;
    }

    // For dual value operators, initialize with array if not already
    if (DualOperators.includes(operatorId as OperatorType)) {
      if (!Array.isArray(selected.value)) {
        selected.value = ['', ''];  // Initialize with empty array
      }
    } else if (NoValueOperators.includes(operatorId as OperatorType)) {
      // For no-value operators, set to null
      selected.value = null;
    } else if (!selected.value) {
      // For single value operators, initialize as empty string if needed
      selected.value = '';
    }
  }

  // Update onOperatorChange to initialize values appropriately
  onOperatorChange(newOperator: string, index: number): void {
    this.operatorChange.emit({ newOperator, index });
    this.selectedFields[index].operatorTouched = true;

    // Initialize value based on new operator
    if (this.selectedFields[index]) {
      this.initializeValueForOperator(this.selectedFields[index]);
    }
  }

  // Update onSearchSelectedField to validate before emitting
  onSearchSelectedField(selected: SelectedField): void {
    // Mark fields as touched for validation
    selected.parentTouched = true;
    selected.operatorTouched = true;
    selected.valueTouched = true;

    // Validate all required fields
    if (!this.isParentValid(selected)) {
      console.error('Parent validation failed');
      return;
    }

    if (!this.isOperatorValid(selected)) {
      console.error('Operator validation failed');
      return;
    }

    if (!this.isValueValid(selected)) {
      console.error('Value validation failed');
      return;
    }

    // If all validations pass, create search criteria
    const searchCriteria: SearchCriteria = {
      parent: selected.parentSelected || selected.parent,
      field: {
        id: selected.field.id,
        label: selected.field.label
      },
      operator: {
        id: selected.operator?.id || '',
        label: selected.operator?.label || ''
      },
      value: selected.value || null
    };

    // Emit the selected field (with validation state)
    this.searchSelectedField.emit(selected);
  }

  onDeleteSelectedField(index: number): void {
    this.deleteSelectedField.emit(index);
  }

  // Add these methods for numeric validation

  // Validate single number input field
  validateNumberInput(event: Event, selected: SelectedField): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // If empty, allow it (will be caught by required validation if needed)
    if (!value) {
      return;
    }

    // Check if value is numeric
    if (!/^-?\d*\.?\d*$/.test(value)) {
      // If not numeric, revert to previous valid value or empty string
      input.value = selected.value || '';
      selected.value = input.value;
    }
  }

  // Validate dual number input fields
  validateDualNumberInput(event: Event, selected: SelectedField, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // If empty, allow it (will be caught by required validation if needed)
    if (!value) {
      return;
    }

    // Check if value is numeric
    if (!/^-?\d*\.?\d*$/.test(value)) {
      // If not numeric, revert to previous valid value or empty string
      if (Array.isArray(selected.value)) {
        input.value = selected.value[index] || '';
        selected.value[index] = input.value;
      } else {
        // Handle case where value isn't an array yet
        selected.value = ['', ''];
        input.value = '';
      }
    }
  }

  // Get text to display when button is clicked
  getButtonDisplayText(selected: SelectedField, index?: number): string {
    // You can customize what text appears after the button is clicked
    // This could come from the field data or be generated dynamically
    const fieldLabel = selected.field.label || 'Selected';
    const timestamp = new Date().toLocaleTimeString();

    if (index === undefined) {
      return `${fieldLabel} selected at ${timestamp}`;
    } else {
      return `Option ${index + 1} - ${fieldLabel} selected at ${timestamp}`;
    }
  }

  // Handle button click
  onFieldButtonClick(selected: SelectedField, index?: number): void {
    selected.valueTouched = true;

    // Generate display text
    const displayText = this.getButtonDisplayText(selected, index);

    if (index === undefined) {
      // For single button, store the display text instead of boolean
      // Before storing text, check if it was already set (toggle behavior)
      selected.value = selected.value ? null : displayText;
    } else {
      // For dual buttons, ensure we have an array and store text at specific index
      if (!Array.isArray(selected.value)) {
        selected.value = [null, null];
      }
      // Toggle behavior - set to null if already has text, otherwise set the text
      selected.value[index] = selected.value[index] ? null : displayText;
    }
  }

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

  // Get selected values for dual dropdown at specific index
  getDualSelectedDropdownValues(selected: SelectedField, index: number): string[] {
    if (!selected.value || !Array.isArray(selected.value) || !selected.value[index]) {
      return [];
    }

    const value = selected.value[index];

    // If the value is already an object with id
    if (typeof value === 'object' && value !== null && 'id' in value) {
      return [value.id];
    }

    // If it's a simple string
    if (typeof value === 'string') {
      return [value];
    }

    return [];
  }

  // Handle single dropdown value change
  onDropdownValueChange(selectedItems: DropdownItem[], index: number): void {
    const selected = this.selectedFields[index];

    if (!selectedItems || selectedItems.length === 0) {
      selected.value = null;
    } else if (selectedItems.length === 1) {
      // Store the complete object to preserve language information
      selected.value = selectedItems[0];
    } else {
      // Store array of objects for multi-select
      selected.value = selectedItems;
    }

    // Mark as touched for validation
    selected.valueTouched = true;
  }

  // Handle dual dropdown value change
  onDualDropdownValueChange(selectedItems: DropdownItem[], index: number, dualIndex: number): void {
    const selected = this.selectedFields[index];

    // Ensure value is an array of length 2
    if (!Array.isArray(selected.value) || selected.value.length !== 2) {
      selected.value = [null, null];
    }

    if (!selectedItems || selectedItems.length === 0) {
      selected.value[dualIndex] = null;
    } else if (selectedItems.length === 1) {
      // Store the complete object to preserve language information
      selected.value[dualIndex] = selectedItems[0];
    } else {
      // For multiple selections (unusual case)
      selected.value[dualIndex] = selectedItems[0];
    }

    // Mark as touched for validation
    selected.valueTouched = true;
  }

  // For similar operator field dropdown values
  getSimilarFieldDropdownValues(selected: SelectedField): string[] {
    if (!selected.value || !Array.isArray(selected.value) || !selected.value[0]) {
      return [];
    }

    const value = selected.value[0];

    // If the value is already an object with id
    if (typeof value === 'object' && value !== null && 'id' in value) {
      return [value.id];
    }

    // If it's a simple string
    if (typeof value === 'string') {
      return [value];
    }

    return [];
  }

  // For similar operator brand dropdown values
  getSimilarBrandDropdownValues(selected: SelectedField): string[] {
    if (!selected.value || !Array.isArray(selected.value) || !selected.value[1]) {
      return [];
    }

    const value = selected.value[1];

    // If the value is already an object with id
    if (typeof value === 'object' && value !== null && 'id' in value) {
      return [value.id];
    }

    // If it's a simple string
    if (typeof value === 'string') {
      return [value];
    }

    return [];
  }

  // Handle change of the field value in similar operator
  onSimilarFieldDropdownChange(selectedItems: DropdownItem[], index: number): void {
    const selected = this.selectedFields[index];

    // Ensure value is an array
    if (!Array.isArray(selected.value)) {
      selected.value = [null, null];
    }

    if (!selectedItems || selectedItems.length === 0) {
      selected.value[0] = null;
    } else if (selectedItems.length === 1) {
      selected.value[0] = selectedItems[0];
    } else {
      selected.value[0] = selectedItems[0];
    }

    // Mark as touched for validation
    selected.valueTouched = true;
  }

  // Handle change of the brand dropdown in similar operator
  onSimilarBrandDropdownChange(selectedItems: DropdownItem[], index: number): void {
    const selected = this.selectedFields[index];

    // Ensure value is an array
    if (!Array.isArray(selected.value)) {
      selected.value = [null, null];
    }

    if (!selectedItems || selectedItems.length === 0) {
      selected.value[1] = null;
    } else if (selectedItems.length === 1) {
      selected.value[1] = selectedItems[0];
    } else {
      selected.value[1] = selectedItems[0];
    }

    // Mark as touched for validation
    selected.valueTouched = true;
  }

  // Handle click of button in similar operator case
  onSimilarButtonClick(selected: SelectedField): void {
    // Ensure value is an array
    if (!Array.isArray(selected.value)) {
      selected.value = [null, null];
    }

    // Toggle the button selection
    const displayText = this.getButtonDisplayText(selected);
    selected.value[0] = selected.value[0] ? null : displayText;

    // Mark as touched for validation
    selected.valueTouched = true;
  }
}
