import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FieldType, FieldTypeMapping } from '../../enums/field-types.enum';
import { OperatorType, NoValueOperators, DualOperators } from '../../enums/operator-types.enum';

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

  onSendTableContent(): void {
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
    this.sendTableContent.emit();
  }

  getFieldType(selected: SelectedField): FieldType {
    return FieldTypeMapping[selected.field.toLowerCase()] || FieldType.Text;
  }

  getValueControl(selected: SelectedField): any {
    if (!selected.operator || selected.operator === 'select') {
      return { show: false };
    }

    if (NoValueOperators.includes(selected.operator as OperatorType)) {
      return { show: false };
    }

    const fieldType = this.getFieldType(selected);
    let control: any = {};
    control.dual = DualOperators.includes(selected.operator as OperatorType);
    control.show = true;

    if (!control.dual && fieldType === FieldType.Text && selected.field.toLowerCase() === 'brand') {
      control.type = FieldType.Dropdown;
      control.options = this.dropdownData.brandValues;
    } else {
      control.type = fieldType;
    }
    return control;
  }

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

    if (control.type === FieldType.Number) {
      return /^[0-9]+$/.test(value);
    }

    if (control.type === FieldType.Text) {
      return /^[a-zA-Z0-9 ]+$/.test(value);
    }

    return true;
  }

  isOperatorValid(selected: SelectedField): boolean {
    return !!selected.operator && selected.operator !== 'select';
  }

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