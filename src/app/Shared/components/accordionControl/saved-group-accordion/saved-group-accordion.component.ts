import { Component, EventEmitter, Input, Output, OnInit, HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'app-saved-group-accordion',
  standalone: false,
  templateUrl: './saved-group-accordion.component.html',
  styleUrl: './saved-group-accordion.component.scss'
})
export class SavedGroupAccordionComponent implements OnInit {
  @Input() set groups(value: any[]) {
    this._groups = this.processGroups(value);
  }

  get groups(): any[] {
    return this._groups;
  }

  private _groups: any[] = [];
  @Input() selectedField: any = null;
  @Output() fieldSelected = new EventEmitter<any>();
  @Output() groupFieldTitleClicked = new EventEmitter<any>();

  expandedGroups: Set<string> = new Set();
  expandedFields: Set<string> = new Set();
  selectedFieldGroup: any = null;

  contextMenuVisible: boolean = false;
  contextMenuPosition = { x: 0, y: 0 };

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.restoreState();
  }

  // Process incoming groups data and add unique IDs
  private processGroups(groups: any[]): any[] {
    if (!groups) return [];

    return groups.map(group => {
      const processedGroup = { ...group };
      if (processedGroup.groupFields) {
        processedGroup.groupFields = processedGroup.groupFields.map((fieldGroup: any, fgIndex: number) => {
          const processedFieldGroup = { ...fieldGroup };
          if (processedFieldGroup.fields) {
            processedFieldGroup.fields = processedFieldGroup.fields.map((field: any, fIndex: number) => {
              // Create a unique ID using group, fieldGroup, and field indices
              const uniqueId = `field_${group.groupTitle.id}_${fieldGroup.title?.id || fgIndex}_${fIndex}`;
              return { ...field, _uniqueId: uniqueId };
            });
          }
          return processedFieldGroup;
        });
      }
      return processedGroup;
    });
  }

  toggleGroup(groupId: string) {
    if (this.expandedGroups.has(groupId)) {
      this.expandedGroups.delete(groupId);
    } else {
      this.expandedGroups.add(groupId);
    }
    this.saveState();
  }

  toggleField(fieldGroupId: string) {
    if (this.expandedFields.has(fieldGroupId)) {
      this.expandedFields.delete(fieldGroupId);
    } else {
      this.expandedFields.add(fieldGroupId);
    }
    this.saveState();
  }

  onFieldClick(field: any, event: Event): void {
    event.preventDefault();
    this.selectedField = field;
    this.fieldSelected.emit(field);
    console.log('Field clicked:', field);
    this.saveState();
  }

  onGroupFieldTitleClick(fieldGroup: any, event: Event): void {
    event.preventDefault();
    console.log('On field group:', fieldGroup);
    this.groupFieldTitleClicked.emit(fieldGroup);
    this.saveState();
  }

  onGroupFieldTitleRightClick(event: MouseEvent, fieldGroup: any) {
    event.preventDefault();
    console.log('Right-click detected on field group:', fieldGroup);
    this.contextMenuVisible = true;
    this.contextMenuPosition = { x: event.clientX - 100, y: event.clientY - 100 };
    console.log('Context menu position set to:', this.contextMenuPosition);
    this.selectedFieldGroup = fieldGroup;
  }

  onEditGroupFieldTitle() {
    if (this.selectedFieldGroup) {
      const title = this.selectedFieldGroup.title || this.selectedFieldGroup.title.title;
      console.log('Edit Group Field Title:', title);
    }
    this.contextMenuVisible = false;
  }

  onDeleteGroupFieldTitle() {
    if (this.selectedFieldGroup) {
      const title = this.selectedFieldGroup.title || this.selectedFieldGroup.title.title;
      console.log('Delete Group Field Title:', title);
    }
    this.contextMenuVisible = false;
  }

  onGroupRightClick(event: MouseEvent, group: any) {
    event.preventDefault();
    console.log('Right-click on:', group.groupTitle.title);
  }

  getFieldTitle(field: any): string {
    if (field.field?.label && field.operator?.label) {
      return `${field.field.label} ${field.operator.label} ${field.value}`;
    } else if (typeof field.field === 'string' && typeof field.operator === 'string') {
      return `${field.field} ${field.operator} ${field.value}`;
    } else {
      return '';
    }
  }

  getFieldLabel(field: any): string {
    if (field.field?.label && field.operator?.label) {
      return `${field.field.label} ${field.operator.label} ${field.value}`;
    } else if (typeof field.field === 'string' && typeof field.operator === 'string') {
      return `${field.field} ${field.operator} ${field.value}`;
    } else {
      return field.id || '';
    }
  }

  isFieldSelected(field: any): boolean {
    if (!this.selectedField) return false;

    // Use the unique ID for comparison if available
    if (field._uniqueId && this.selectedField._uniqueId) {
      return field._uniqueId === this.selectedField._uniqueId;
    }

    // Fall back to previous comparison logic
    if (field.field?.id && this.selectedField.field?.id) {
      return field.field.id === this.selectedField.field.id &&
        field.operator?.id === this.selectedField.operator?.id &&
        field.value === this.selectedField.value;
    } else if (field.id && this.selectedField.id) {
      return field.id === this.selectedField.id;
    }

    return field === this.selectedField;
  }

  saveState() {
    const state = {
      expandedGroups: Array.from(this.expandedGroups),
      expandedFields: Array.from(this.expandedFields),
      selectedField: this.selectedField
        ? this.getSelectedFieldIdentifier(this.selectedField)
        : null
    };
    localStorage.setItem('savedAccordionState', JSON.stringify(state));
  }

  getSelectedFieldIdentifier(field: any): any {
    // Include the unique ID if available
    if (field._uniqueId) {
      return { uniqueId: field._uniqueId };
    }

    // Create a simplified identifier that can be used to find the field later
    if (field.field?.id) {
      return {
        fieldId: field.field.id,
        operatorId: field.operator?.id,
        value: field.value
      };
    } else {
      return {
        field: field.field,
        operator: field.operator,
        value: field.value
      };
    }
  }

  restoreState() {
    const stored = localStorage.getItem('savedAccordionState');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.expandedGroups) {
          this.expandedGroups = new Set<string>(parsed.expandedGroups);
        }
        if (parsed.expandedFields) {
          this.expandedFields = new Set<string>(parsed.expandedFields);
        }
        if (parsed.selectedField) {
          this.selectedField = this.findFieldObject(parsed.selectedField);
        }
      } catch (err) {
        console.error('Error restoring state', err);
      }
    }
  }

  findFieldObject(savedField: any): any {
    // Try to find by unique ID first if available
    if (savedField.uniqueId) {
      for (const g of this.groups) {
        for (const fg of g.groupFields) {
          for (const f of fg.fields) {
            if (f._uniqueId === savedField.uniqueId) {
              return f;
            }
          }
        }
      }
    }

    // Fall back to previous field finding logic
    for (const g of this.groups) {
      for (const fg of g.groupFields) {
        for (const f of fg.fields) {
          if (savedField.fieldId && f.field?.id === savedField.fieldId &&
            (!savedField.operatorId || f.operator?.id === savedField.operatorId) &&
            (!savedField.value || f.value === savedField.value)) {
            return f;
          } else if (savedField.field &&
            ((typeof f.field === 'string' && f.field === savedField.field) ||
              (f.field?.label === savedField.field)) &&
            ((typeof f.operator === 'string' && f.operator === savedField.operator) ||
              (f.operator?.label === savedField.operator)) &&
            (!savedField.value || f.value === savedField.value)) {
            return f;
          }
        }
      }
    }
    return savedField;
  }

  clearSelectedField(): void {
    this.selectedField = null;
    this.saveState();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.contextMenuVisible) {
      console.log('Document click detected, hiding context menu');
      this.contextMenuVisible = false;
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  onDocumentRightClick(event: MouseEvent) {
    if (this.contextMenuVisible && !this.elementRef.nativeElement.contains(event.target)) {
      console.log('Document right-click detected, hiding context menu');
      this.contextMenuVisible = false;
    }
  }
}