import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SelectedField } from '../../../../interfaces/selectedFields.interface';
import { FieldTypeMapping, FieldType, DropdownDataMapping } from '../../../../enums/field-types.enum';
import { DualOperators, NoValueOperators, OperatorType } from '../../../../enums/operator-types.enum';
import { SearchCriteria } from '../../../../interfaces/search-criteria.interface';
import { SearchRequest } from '../../../../interfaces/search-request.interface';
import { StorageService } from './storage.service';
import { SearchService } from '../../../../services/search.service';
import { DropdownItem } from '../../../../interfaces/table-dropdown.interface';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  private selectedFieldsSubject = new BehaviorSubject<SelectedField[]>([]);
  public selectedFields$ = this.selectedFieldsSubject.asObservable();

  private operatorsDdDataSubject = new BehaviorSubject<any>(null);

  constructor(
    private storageService: StorageService,
    private searchService: SearchService
  ) {
    // Load operators first, then load saved fields when operators are ready
    this.searchService.getDropdownData().subscribe({
      next: (data) => {
        this.operatorsDdDataSubject.next(data);
        // Now load saved fields after operators are available
        this.loadSavedFields();
      },
      error: (err) => {
        console.error('Failed to load operators data', err);
        // Still try to load saved fields even if operators failed
        this.loadSavedFields();
      }
    });
  }

  private loadSavedFields(): void {
    // Try loading from 'selectedFields' first (where we save)
    let stored = this.storageService.getItem('selectedFields');

    // If not found, try the legacy key 'savedSearchFields'
    if (!stored) {
      stored = this.storageService.getItem('savedSearchFields');
    }

    // Wait for operators data to be loaded before restoring fields
    this.loadOperatorsData();

    if (stored) {
      try {
        // If it's in the SearchCriteria format, convert it
        if (stored.includes('rowId')) {
          const parsedCriteria = JSON.parse(stored) as SearchCriteria[];
          const fields = this.restoreValueFormat(parsedCriteria);
          this.selectedFieldsSubject.next(fields);
        } else {
          // Otherwise parse directly as SelectedField[]
          const fields = JSON.parse(stored) as SelectedField[];

          // Ensure operator labels are set properly
          fields.forEach(field => {
            if (field.operator && field.operatorOptions) {
              const foundOperator = field.operatorOptions.find(op => op.id === field.operator.id);
              if (foundOperator) {
                field.operator = {
                  id: field.operator.id,
                  label: foundOperator.label || field.operator.id
                };
              }
            }
          });

          this.selectedFieldsSubject.next(fields);
        }
      } catch (e) {
        console.error('Error loading saved fields:', e);
        this.selectedFieldsSubject.next([]);
      }
    } else {
      this.selectedFieldsSubject.next([]);
    }
  }

  private loadOperatorsData(): void {
    // Get operators data from the SearchService
    this.searchService.getDropdownData().subscribe({
      next: (data) => {
        // Initialize with the structure we expect
        const operatorsData = {
          boolOperations: data?.boolOperations || [],
          stringOperations: data?.stringOperations || [],
          dateOperations: data?.dateOperations || [],
          numberOperations: data?.numberOperations || [],
          timeOperations: data?.timeOperations || []
        };
        this.operatorsDdDataSubject.next(operatorsData);
      },
      error: (err) => {
        // In case of an error, still provide a default structure
        const defaultOperatorsData = {
          boolOperations: [],
          stringOperations: [],
          dateOperations: [],
          numberOperations: [],
          timeOperations: []
        };
        this.operatorsDdDataSubject.next(defaultOperatorsData);
      }
    });
  }

  // Get operators data for a specific field
  getOperatorOptions(field: string): any[] {
    const operatorsData = this.operatorsDdDataSubject.getValue();
    if (!operatorsData) return [];

    const fieldLower = field.toLowerCase();
    switch (FieldTypeMapping[fieldLower]) {
      case FieldType.Bool:
        return operatorsData.boolOperations || [];
      case FieldType.Text:
        return operatorsData.stringOperations || [];
      case FieldType.Date:
        return operatorsData.dateOperations || [];
      case FieldType.Number:
        return operatorsData.numberOperations || [];
      case FieldType.Dropdown:
        return operatorsData.stringOperations || [];
      default:
        return operatorsData.stringOperations || []; // Default to string operations
    }
  }

  // Get dropdown data for a field
  getDropdownDataForField(fieldId: string): any[] {
    const dataSource = DropdownDataMapping[fieldId];
    // Implement dropdown data source mapping here
    return [];
  }

  // Add field to selection
  addField(
    field: { id: string, label: string },
    parent: { id: string, label: string },
    path: string = '',
    currentLanguage: string = 'en',
    isParentArray: boolean = false
  ): void {

    const operatorOptions = this.getOperatorOptions(field.id);
    const defaultOperator = {
      id: 'select',
      label: currentLanguage === 'de' ? 'Auswählen' : 'Select'
    };
    const defaultValue = null;
    const dropdownData = this.getDropdownDataForField(field.id) || [];

    // Create a new SelectedField object with all required properties
    const selectedField: SelectedField = {
      rowid: '',
      parent: parent,
      field: field,
      operator: defaultOperator,
      operatorOptions: operatorOptions,
      value: defaultValue,
      dropdownData: dropdownData,
      parentTouched: false,
      operatorTouched: false,
      valueTouched: false,
      isParentArray: isParentArray,
    };
    // Get current fields and add the new one
    const currentFields = this.selectedFieldsSubject.getValue();
    const updatedFields = [...currentFields, selectedField];
    this.selectedFieldsSubject.next(updatedFields);

    // Save to storage
    this.storageService.setItem('selectedFields', JSON.stringify(updatedFields));
  }

  // Update parent selection and save to localStorage
  updateParentSelection(index: number, selectedValues: DropdownItem[], currentLanguage: string): void {
    const fields = this.selectedFieldsSubject.getValue();
    if (!fields[index]) return;
    const field = fields[index];
    field.parentSelected = selectedValues.length > 0 ? selectedValues : null;
    field.parentTouched = true;
    this.selectedFieldsSubject.next(fields);
    this.saveFieldsToStorage(fields);
  }

  // Update operator and reset value
  updateOperator(index: number, newOperatorId: string, currentLanguage: string): void {
    const currentFields = this.selectedFieldsSubject.getValue();
    console.log('currentFields', currentFields);
    if (index < 0 || index >= currentFields.length) return;

    const field = currentFields[index];
    // Handle 'select' option selection
    if (newOperatorId === 'select') {
      field.operator = {
        id: 'select',
        label: currentLanguage === 'de' ? 'Auswählen' : 'Select'
      };
      field.value = null;
      field.operatorTouched = true;

      console.log('Updated field:-1', field);
      // Save updated fields
      this.selectedFieldsSubject.next([...currentFields]);
      this.storageService.setItem('selectedFields', JSON.stringify(currentFields));
      return;
    }

    const selectedOption = field.operatorOptions.find(op => op.id === newOperatorId);
    if (!selectedOption) return;

    field.operator = {
      id: selectedOption.id,
      label: selectedOption[currentLanguage] || selectedOption.id
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

    // Save updated fields
    this.selectedFieldsSubject.next([...currentFields]);
    this.storageService.setItem('selectedFields', JSON.stringify(currentFields));
  }

  // Delete field
  deleteField(index: number): void {
    const currentFields = this.selectedFieldsSubject.getValue();
    if (index < 0 || index >= currentFields.length) return;

    currentFields.splice(index, 1);
    this.selectedFieldsSubject.next([...currentFields]);
    this.storageService.setItem('selectedFields', JSON.stringify(currentFields));
    localStorage.removeItem('savedAccordionState');
  }

  // Clear all fields
  // Clear fields and ensure proper cleanup
  clearFields(): void {
    // Update the subject with empty array
    this.selectedFieldsSubject.next([]);

    // Clear from storage to ensure persistence
    this.storageService.removeItem('selectedFields');
    this.storageService.removeItem('savedSearchFields'); // Clear legacy key too

  }

  /**
 * Update field labels for language change
 * This ensures all fields display in the correct language
 */
  updateFieldLabels(
    firstSystemFieldsMap: Map<string, any>,
    systemFieldsMap: Map<string, any>,
    systemTypeData: any[],
    currentLanguage: string
  ): void {
    const currentFields = this.selectedFieldsSubject.getValue();
    if (!currentFields || currentFields.length === 0) return;

    // Create a new array to avoid direct mutation
    const updatedFields = currentFields.map(field => {
      const updatedField = { ...field };

      // Update field label from maps, keeping ID the same
      if (updatedField.field.id) {
        // Try to find the field in firstSystemFieldsMap
        const firstSystemField = firstSystemFieldsMap.get(updatedField.field.id);
        if (firstSystemField && firstSystemField.label) {
          updatedField.field.label = firstSystemField.label;
        } else {
          // If not found, try systemFieldsMap
          const systemField = systemFieldsMap.get(updatedField.field.id);
          if (systemField && systemField.label) {
            updatedField.field.label = systemField.label;
          }
        }
      }

      // Update parent label if applicable
      if (updatedField.parent && updatedField.parent.id) {
        const parentId = updatedField.parent.id;

        // Look for the parent in system type data (system types are parents for second accordion)
        const systemTypeItem = systemTypeData.find(item => item.id === parentId);
        if (systemTypeItem && systemTypeItem.label) {
          updatedField.parent = {
            id: parentId,
            label: systemTypeItem.label
          };
        }
      }

      // Update operator label if needed
      if (updatedField.operator && updatedField.operator.id) {
        // Here we would need access to operators data in the correct language
        // For now, we'll just ensure the structure is maintained
        const operatorsData = this.operatorsDdDataSubject.getValue();

        if (operatorsData) {
          // Find the operator in all operator types
          const operatorTypes = [
            'stringOperations', 'numberOperations', 'dateOperations',
            'boolOperations', 'timeOperations'
          ];

          let found = false;
          for (const type of operatorTypes) {
            if (!operatorsData[type]) continue;

            const operator = operatorsData[type].find(
              (op: any) => op.id === updatedField.operator?.id
            );

            if (operator) {
              updatedField.operator = {
                id: operator.id,
                label: operator.label
              };
              found = true;
              break;
            }
          }

          // If not found, preserve the operator ID but update label with default text
          if (!found && updatedField.operator) {
            const defaultLabel = currentLanguage === 'de' ? 'Auswählen' : 'Select';
            updatedField.operator = {
              id: updatedField.operator.id,
              label: defaultLabel
            };
          }
        }
      }

      return updatedField;
    });

    // Update the BehaviorSubject with the new array
    this.selectedFieldsSubject.next(updatedFields);

    // Save the updated fields to storage
    this.saveFieldsToStorage(updatedFields);
  }

  /**
   * Save fields to storage
   */
  private saveFieldsToStorage(fields: SelectedField[]): void {
    if (!fields) return;

    try {
      const fieldsJson = JSON.stringify(fields);
      this.storageService.setItem('selectedFields', fieldsJson);
    } catch (e) {
      console.error('Error saving fields to storage:', e);
    }
  }

  // Update fields using a map without changing parent values
  updateFieldLabelsWithMap(
    fieldsMap: Map<string, any>,
    currentFields: SelectedField[]
  ): void {
    if (currentFields.length === 0) return;

    const updatedFields = currentFields.map((selectedField) => {
      if (selectedField.field && selectedField.field.id) {
        const field = fieldsMap.get(selectedField.field.id);
        if (field) {
          selectedField.field = {
            id: selectedField.field.id,
            label: field.label || ''
          };
        }
      }
      return selectedField;
    });

    this.selectedFieldsSubject.next(updatedFields);
    this.storageService.setItem('selectedFields', JSON.stringify(updatedFields));
  }

  // Convert saved search criteria to selected fields
  restoreValueFormat(criteria: SearchCriteria[]): SelectedField[] {
    if (!criteria || !Array.isArray(criteria)) return [];

    return criteria.map(item => {
      // Get the value to process
      let value = item.value;
      const operatorId = item.operator?.id || '';
      const fieldId = item.field?.id || '';
      const rowId = item.rowId || '';

      // Handle parent - it could be an array or a single object
      let parent: { id: string; label: string };
      let parentSelected: any | undefined;

      // Check if item.parent is an array and handle it
      if (Array.isArray(item.parent)) {
        if (item.parent.length > 0) {
          // For ANY array (even length 1), use parentSelected to maintain dropdown
          parentSelected = item.parent.map(p => ({
            id: p.id || '',
            label: p.label || '' // Ensure label is never undefined
          }));

          // Use first parent as the main parent
          parent = {
            id: item.parent[0].id || '',
            label: item.parent[0].label || '' // Ensure label is never undefined
          };
        } else {
          // Empty array case
          parent = { id: '', label: '' };
          parentSelected = [];
        }
      } else if (item.parent && typeof item.parent === 'object') {
        // Single object case - DO NOT set parentSelected for single objects
        parent = {
          id: item.parent.id || '',
          label: item.parent.label || '' // Ensure label is never undefined
        };
      } else {
        // Fallback case
        parent = { id: '', label: '' };
      }

      // Use FieldTypeMapping to determine the field type
      const fieldType = FieldTypeMapping[fieldId] || FieldType.Text;

      // Check if this operator typically uses dual values
      const isDualOperator = DualOperators.includes(operatorId as OperatorType);

      // Handle value formatting based on type and operator
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
              } catch (e) { }
              return dateStr;
            });
            break;

          case FieldType.Dropdown:
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
            } catch (e) { }
            break;
        }
      }

      // Get operator options for this field with proper type handling
      const operatorOptions = this.getOperatorOptions(item.field.id) || [];

      // Construct operator with proper type handling
      const operator = {
        id: item.operator?.id || '',
        label: item.operator?.label || ''
      };

      // Construct field with proper type handling
      const field = {
        id: item.field?.id || '',
        label: item.field?.label || ''
      };

      // Reconstruct the field structure with strict type adherence
      const selectedField: SelectedField = {
        rowid: rowId, // Include the rowId from backend
        parent: parent,
        field: field,
        operator: operator,
        operatorOptions: operatorOptions,
        value: value,
        parentTouched: false,
        operatorTouched: false,
        valueTouched: false
      };

      // Only set parentSelected when it exists (array case)
      if (parentSelected) {
        selectedField.parentSelected = parentSelected;
      }

      return selectedField;
    });
  }

  // Helper method to format dates for HTML date input (YYYY-MM-DD format)
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Add field from saved group
  addSavedField(field: SearchCriteria): void {
    if (!field) return;

    const selectedField = this.convertSavedFieldToSelectedField(field);
    if (selectedField) {
      const currentFields = this.selectedFieldsSubject.getValue();
      const updatedFields = [...currentFields, selectedField];
      this.selectedFieldsSubject.next(updatedFields);
      this.storageService.setItem('selectedFields', JSON.stringify(updatedFields));
    }
  }

  // Add all fields from a saved group
  addSavedGroup(groupField: SearchRequest): void {
    if (!groupField || !groupField.fields || !Array.isArray(groupField.fields)) return;

    // Convert each field in the group
    const newSelectedFields = groupField.fields
      .map(field => this.convertSavedFieldToSelectedField(field))
      .filter(field => field !== null) as SelectedField[];
    if (newSelectedFields.length > 0) {
      const currentFields = this.selectedFieldsSubject.getValue();
      const updatedFields = [...currentFields, ...newSelectedFields];
      this.selectedFieldsSubject.next(updatedFields);
      this.storageService.setItem('selectedFields', JSON.stringify(updatedFields));
    }
  }

  // Convert saved field to SelectedField format
  private convertSavedFieldToSelectedField(field: SearchCriteria): SelectedField | null {
    if (!field || !field.field) return null;

    const fieldId = field.field.id || '';
    const operatorId = field.operator?.id || '';

    // Get appropriate operator options for this field
    const operatorOptions = this.getOperatorOptions(fieldId);

    // Handle parent - it could be an array or a single object
    let parent: { id: string; label: string };
    let parentSelected: any | undefined;

    // Check if field.parent is an array and handle it
    if (Array.isArray(field.parent)) {
      if (field.parent.length > 0) {
        // For ANY array (even length 1), use parentSelected to maintain dropdown
        parentSelected = field.parent.map(p => ({
          id: p.id || '',
          label: p.label || ''
        }));

        // Use first parent as the main parent
        parent = {
          id: field.parent[0].id || '',
          label: field.parent[0].label || ''
        };
      } else {
        // Empty array case
        parent = { id: '', label: '' };
        parentSelected = [];
      }
    } else if (field.parent && typeof field.parent === 'object') {
      // Single object case
      parent = {
        id: field.parent.id || '',
        label: field.parent.label || ''
      };
    } else {
      // Fallback case
      parent = { id: '', label: '' };
    }

    // Process the value based on operator and field type
    let value = field.value;

    // Get field type
    const fieldType = FieldTypeMapping[fieldId] || FieldType.Text;

    // Check if this operator typically uses dual values
    const isDualOperator = DualOperators.includes(operatorId as OperatorType);

    // Format value for the relation table
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
            } catch (e) { }
            return dateStr;
          });
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
          } catch (e) { }
          break;
      }
    }

    // Get dropdown data if needed
    const dropdownData = this.getDropdownDataForField(fieldId) || [];

    // Create the selected field
    const selectedField: SelectedField = {
      rowid: field.rowId || '',
      parent: parent,
      parentSelected: parentSelected,
      field: {
        id: field.field.id || '',
        label: field.field.label || ''
      },
      operator: {
        id: field.operator?.id || '',
        label: field.operator?.label || ''
      },
      operatorOptions: operatorOptions,
      value: value,
      dropdownData: dropdownData,
      // Initialize touched states - already validated since coming from saved data
      parentTouched: true,
      operatorTouched: true,
      valueTouched: true
    };

    // Only set parentSelected when it exists (array case)
    if (parentSelected) {
      selectedField.parentSelected = parentSelected;
    }

    return selectedField;
  }

  // Convert selected fields to search criteria for backend submission
  convertSelectedFieldsToSearchCriteria(selectedFields: SelectedField[]): SearchCriteria[] {
    if (selectedFields.length === 0) return [];

    return selectedFields.map(field => {
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


      // Return the search criteria with proper parent handling and rowId
      return {
        rowId: field.rowid || '', // Include rowId, empty if not exists
        parent: field.parent,
        parentSelected: field.parentSelected,
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
  }

  // Get current selected fields
  get selectedFields(): SelectedField[] {
    return this.selectedFieldsSubject.getValue();
  }

  updateSelectedFields(fields: SelectedField[]): void {
    this.selectedFieldsSubject.next([...fields]);
    this.storageService.setItem('selectedFields', JSON.stringify(fields));
  }
}