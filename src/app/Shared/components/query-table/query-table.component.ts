import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface SelectedField {
  parent: string;
  field: string;
  operator: string;
  operatorOptions: any[];
  value: any;
  operatorTouched?: boolean; // Tracks whether the operator dropdown has been interacted with
  valueTouched?: boolean | boolean[]; // Tracks whether the value control(s) have been touched
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

  // Global flag to indicate the user has attempted to submit.
  submitted: boolean = false;

  /**
   * Called when the operator dropdown value changes.
   * Emits the change and marks the field as touched.
   */
  onOperatorChange(newOperator: string, index: number): void {
    this.operatorChange.emit({ newOperator, index });
    this.selectedFields[index].operatorTouched = true;
  }

  onSearchSelectedField(selected: SelectedField): void {
    this.searchSelectedField.emit(selected);
  }

  onDeleteSelectedField(index: number): void {
    this.deleteSelectedField.emit(index);
  }

  /**
   * Called when the user clicks the "Send Table Content" button.
   * Marks all fields' operator and value controls as touched and sets the submitted flag.
   * Then validates each field.
   */
  onSendTableContent(): void {
    // Mark all fields as touched so that validation errors appear if needed.
    this.selectedFields.forEach(field => {
      field.operatorTouched = true;
      const control = this.getValueControl(field);
      if (control.show) {
        if (control.dual) {
          field.valueTouched = [true, true];
        } else {
          field.valueTouched = true;
        }
      }
    });
    this.submitted = true;

    const invalidOperator = this.selectedFields.find(field => !this.isOperatorValid(field));
    if (invalidOperator) {
      alert(`Please select a valid operator for the field "${invalidOperator.field}".`);
      return;
    }
    // (Optionally, you can also validate value controls here.)
    this.sendTableContent.emit();
  }

  /**
   * Determines the data type of the field (used to select the appropriate value control).
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
   * Returns the configuration for the value control based on the operator and field type.
   */
  getValueControl(selected: SelectedField): any {
    // If no operator is selected (empty or 'select'), do not display the value control.
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
   * Validates the value(s) in the value control.
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

    if (typeof value === 'string') {
      value = value.trim();
    }

    if (!value) {
      return false;
    }

    if (control.type === 'number') {
      return /^[0-9]+$/.test(value);
    }

    if (control.type === 'text') {
      return /^[a-zA-Z0-9 ]+$/.test(value);
    }

    // For date or dropdown controls, assume valid if not empty.
    return true;
  }

  /**
   * Validates the operator selection.
   * Returns false if the operator is empty or still set to the default value.
   */
  isOperatorValid(selected: SelectedField): boolean {
    return !!selected.operator && selected.operator !== 'select';
  }

  /**
   * Marks the value control for a field as touched.
   * For dual controls, mark the specific index.
   */
  markValueTouched(selected: SelectedField, idx?: number): void {
    const control = this.getValueControl(selected);
    if (control.show) {
      if (control.dual) {
        if (!selected.valueTouched || !Array.isArray(selected.valueTouched)) {
          selected.valueTouched = [false, false];
        }
        if (idx !== undefined) {
          (selected.valueTouched as boolean[])[idx] = true;
        }
      } else {
        selected.valueTouched = true;
      }
    }
  }

  /**
   * Checks whether the value control for a field has been touched.
   * For dual controls, checks the specific index.
   */
  isValueTouched(selected: SelectedField, idx?: number): boolean {
    const control = this.getValueControl(selected);
    if (!control.show) {
      return false;
    }
    if (control.dual) {
      if (!selected.valueTouched || !Array.isArray(selected.valueTouched)) {
        return false;
      }
      if (idx === undefined) {
        return false;
      }
      return (selected.valueTouched as boolean[])[idx];
    } else {
      return !!selected.valueTouched;
    }
  }
}