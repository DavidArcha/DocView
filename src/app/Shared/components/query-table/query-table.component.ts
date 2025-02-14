import { Component, Input, Output, EventEmitter } from '@angular/core';

interface SelectedField {
  parent: string;
  field: string;
  operator: string;
  operatorOptions: any[];
  value: any;
}

@Component({
  selector: 'app-query-table',
  standalone: false,
  templateUrl: './query-table.component.html',
  styleUrl: './query-table.component.scss'
})
export class QueryTableComponent {
  @Input() selectedFields: SelectedField[] = [];
  @Input() dropdownData: any;
  @Input() selectedLanguage: string = 'de';
  @Input() searchName: string = '';

  @Output() operatorChange = new EventEmitter<{ newOperator: string, index: number }>();
  @Output() searchSelectedField = new EventEmitter<SelectedField>();
  @Output() deleteSelectedField = new EventEmitter<number>();
  @Output() sendTableContent = new EventEmitter<void>();

  onOperatorChange(newOperator: string, index: number): void {
    this.operatorChange.emit({ newOperator, index });
  }

  onSearchSelectedField(selected: SelectedField): void {
    this.searchSelectedField.emit(selected);
  }

  onDeleteSelectedField(index: number): void {
    this.deleteSelectedField.emit(index);
  }

  onSendTableContent(): void {
    this.sendTableContent.emit();
  }

  /**
   * Determine the “data type” of the field based on its name.
   */
  getFieldType(selected: SelectedField): string {
    const field = selected.field.toLowerCase();
    if (['copy', 'current', 'deleted'].includes(field)) {
      return 'bool';
    } else if (['edit', 'state', 'user', 'brand'].includes(field)) {
      return 't';
    } else if (field === 'date') {
      return 'date';
    } else if (field === 'version') {
      return 'number';
    } else if (['input', 'visual', 'description'].includes(field)) {
      return 'string';
    } else {
      return 'string';
    }
  }

  /**
   * Return control configuration based on the selected operator and field type.
   */
  getValueControl(selected: SelectedField): any {
    // If no valid operator is selected (empty string or "select"), then don't show a value control.
    if (!selected.operator || selected.operator === 'select') {
      return { show: false };
    }
    const noValueOperators = ['empty', 'not_empty', 'yes', 'no'];
    if (noValueOperators.includes(selected.operator)) {
      return { show: false };
    }
    const dualOperators = ['between', 'not_between', 'similar', 'contains_date'];
    const fieldType = this.getFieldType(selected);
    let control: any = {};
    control.dual = dualOperators.includes(selected.operator);
    control.show = true;

    if (!control.dual && selected.field.toLowerCase() === 'brand') {
      control.type = 'dropdown';
      control.options = this.dropdownData.brandValues;
    } else {
      // Map field type to control type
      if (fieldType === 'date') {
        control.type = 'date';
      } else if (fieldType === 'number') {
        control.type = 'number';
      } else {
        control.type = 'text';
      }
    }
    return control;
  }

  /**
   * Simple validation: check if value(s) exist and conform to expected type.
   * For numeric fields, check for numbers; for text, disallow special characters.
   */
  validateField(selected: SelectedField, idx?: number): boolean {
    const control = this.getValueControl(selected);
    if (!control.show) {
      return true;
    }

    if (control.dual) {
      // Ensure idx is defined before using it
      if (idx === undefined) {
        return false; // or handle as needed
      }
      const value = selected.value ? selected.value[idx] : '';
      if (!value) {
        return false;
      }
      if (control.type === 'number' && isNaN(value)) {
        return false;
      }
      if (control.type === 'text' && /[^a-zA-Z0-9 ]/.test(value)) {
        return false;
      }
      return true;
    } else {
      const value = selected.value;
      if (!value) {
        return false;
      }
      if (control.type === 'number' && isNaN(value)) {
        return false;
      }
      if (control.type === 'text' && /[^a-zA-Z0-9 ]/.test(value)) {
        return false;
      }
      return true;
    }
  }
}