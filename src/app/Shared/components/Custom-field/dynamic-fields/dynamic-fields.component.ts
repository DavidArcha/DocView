import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

export type ControlType = 'dropdown' | 'textbox' | 'textarea' | 'datePicker' | 'button';

export interface DynamicFieldOption {
  value: string | number;
  label: string;
}

export interface DynamicField {
  id: string;
  label: string;
  controlType: ControlType;
  sortKey: number;
  languageTranslator: boolean;
  multiEditorFlag: boolean;
  multiEditorValue: string | number | null;
  value: any;
  valueEn: any;
  options?: DynamicFieldOption[]; // for dropdown/multieditor
}

@Component({
  selector: 'app-dynamic-fields',
  standalone: false,

  templateUrl: './dynamic-fields.component.html',
  styleUrl: './dynamic-fields.component.scss'
})
export class DynamicFieldsComponent implements OnInit {
  @Input() fields: DynamicField[] = [];
  @Output() fieldsChange = new EventEmitter<DynamicField[]>();

  groupedRows: (DynamicField[])[] = [];

  ngOnInit(): void {
    this.prepareRows();
  }

  ngOnChanges(): void {
    this.prepareRows();
  }

  prepareRows(): void {
    if (!this.fields || this.fields.length === 0) {
      this.groupedRows = [];
      return;
    }
    // 1. Sort by sortKey
    const sortedFields = [...this.fields].sort((a, b) => a.sortKey - b.sortKey);
    // 2. Group consecutive dropdowns (max 2 per row)
    this.groupedRows = [];
    let i = 0;
    while (i < sortedFields.length) {
      const curr = sortedFields[i];
      if (
        curr.controlType === 'dropdown' &&
        i + 1 < sortedFields.length &&
        sortedFields[i + 1].controlType === 'dropdown'
      ) {
        // Pair of dropdowns in one row
        this.groupedRows.push([curr, sortedFields[i + 1]]);
        i += 2;
      } else {
        this.groupedRows.push([curr]);
        i++;
      }
    }
  }

  // Value changes
  onValueChange(field: DynamicField, key: 'value' | 'valueEn' | 'multiEditorValue', val: any) {
    field[key] = val;
    this.fieldsChange.emit(this.fields);
  }

  // For languageTranslator: simulate translation/copy for button
  onTranslate(field: DynamicField) {
    field.valueEn = field.value;
    this.fieldsChange.emit(this.fields);
  }
}