import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SelectedField } from '../../interfaces/selectedFields.interface';
import { DualOperators, NoValueOperators, OperatorType } from '../../enums/operator-types.enum';
import { FieldType, FieldTypeMapping } from '../../enums/field-types.enum';
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


  constructor(private searchService: SearchService, private languageService: LanguageService) { }

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageService.language$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        this.selectedLanguage = lang;
        this.loadSystemTypeFields(this.selectedLanguage);
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

  shouldShowValueColumn(): boolean {
    return this.selectedFields.some(field =>
      this.getValueControl(field).show && this.isOperatorValid(field)
    );
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

  getFieldType(selected: SelectedField): FieldType {
    return FieldTypeMapping[selected.field.id.toLowerCase()] || FieldType.Text;
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

  // Update the onSearchSelectedField method to convert to SearchCriteria
  onSearchSelectedField(selected: SelectedField): void {
    // Convert the SelectedField to SearchCriteria format according to the interface
    const searchCriteria: SearchCriteria = {
      parent: selected.parentSelected || selected.parent,  // Use parentSelected if available, otherwise fall back to parent
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

    // Emit the search criteria
    this.searchSelectedField.emit(selected);
  }

  onDeleteSelectedField(index: number): void {
    this.deleteSelectedField.emit(index);
  }
}
