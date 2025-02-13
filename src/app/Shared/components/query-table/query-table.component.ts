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
}
