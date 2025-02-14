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
    if (['copy', 'current', 'delete'].includes(field)) {
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
  * Validate the field's value(s) based on the control type.
  * - For numbers, only digits are allowed.
  * - For text, only alphanumeric characters and spaces are allowed.
  */
  validateField(selected: SelectedField, idx?: number): boolean {
    const control = this.getValueControl(selected);
    if (!control.show) {
      return true;
    }

    let value;
    if (control.dual) {
      if (idx === undefined) {
        return false;
      }
      value = selected.value ? selected.value[idx] : '';
    } else {
      value = selected.value;
    }

    // If the value is a string, trim it.
    if (typeof value === 'string') {
      value = value.trim();
    }

    // Field is required
    if (!value) {
      return false;
    }

    if (control.type === 'number') {
      // Check if value contains only digits
      return /^[0-9]+$/.test(value);
    }

    if (control.type === 'text') {
      // Allow alphanumerics and spaces only.
      return /^[a-zA-Z0-9 ]+$/.test(value);
    }

    // For date or dropdown, assume valid if not empty.
    return true;
  }
}