import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FieldType, FieldTypeMapping, NumericFieldMapping, StringFieldMapping, DateFieldMapping, DropdownFieldMapping } from '../../enums/field-types.enum';
import { OperatorType, NoValueOperators, DualOperators } from '../../enums/operator-types.enum';
import { SelectedField } from '../../interfaces/selectedFields.interface';

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
  @Output() operatorChange = new EventEmitter<{ newOperator: string, index: number }>();
  @Output() searchSelectedField = new EventEmitter<SelectedField>();
  @Output() deleteSelectedField = new EventEmitter<number>();

  // Global flag to indicate the user has attempted to submit.
  submitted: boolean = false;

  FieldType = FieldType; // Add this line to make FieldType accessible in the template

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
    if (control.show) {
      if (control.dual) {
        if (!idx) return false;
        return Boolean(
          selected.valueTouched &&
          Array.isArray(selected.valueTouched) &&
          selected.valueTouched[idx]
        );
      } else {
        return Boolean(selected.valueTouched);
      }
    }
    return false;
  }

  shouldShowValueColumn(): boolean {
    return this.selectedFields.some(field =>
      this.getValueControl(field).show && this.isOperatorValid(field)
    );
  }
}