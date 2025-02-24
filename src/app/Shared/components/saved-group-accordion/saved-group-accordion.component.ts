import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-saved-group-accordion',
  standalone: false,
  templateUrl: './saved-group-accordion.component.html',
  styleUrl: './saved-group-accordion.component.scss'
})
export class SavedGroupAccordionComponent implements OnInit {
  @Input() groups: any[] = [];
  @Input() selectedField: any = null;
  @Output() fieldSelected = new EventEmitter<any>();
  @Output() groupFieldTitleClicked = new EventEmitter<any>();

  expandedGroups: Set<string> = new Set();
  expandedFields: Set<string> = new Set();
  selectedFieldGroup: any = null;

  contextMenuVisible: boolean = false;
  contextMenuPosition = { x: 0, y: 0 };

  ngOnInit() {
    this.restoreState();
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
    this.saveState();
  }

  onGroupFieldTitleClick(fieldGroup: any, event: Event): void {
    event.preventDefault();
    this.groupFieldTitleClicked.emit(fieldGroup.fields);
    this.saveState();
  }

  onGroupFieldTitleRightClick(event: MouseEvent, fieldGroup: any) {
    event.preventDefault();
    this.contextMenuVisible = true;
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.selectedFieldGroup = fieldGroup;
  }

  onEditGroupFieldTitle() {
    if (this.selectedFieldGroup) {
      console.log('Edit Group Field Title:', this.selectedFieldGroup.title.title);
    }
    this.contextMenuVisible = false;
  }

  onDeleteGroupFieldTitle() {
    if (this.selectedFieldGroup) {
      console.log('Delete Group Field Title:', this.selectedFieldGroup.title.title);
    }
    this.contextMenuVisible = false;
  }

  onGroupRightClick(event: MouseEvent, group: any) {
    event.preventDefault();
    console.log('Right-click on:', group.groupTitle.title);
  }

  saveState() {
    const state = {
      expandedGroups: Array.from(this.expandedGroups),
      expandedFields: Array.from(this.expandedFields),
      selectedField: this.selectedField
        ? {
          field: this.selectedField.field,
          operator: this.selectedField.operator
        }
        : null
    };
    localStorage.setItem('savedAccordionState', JSON.stringify(state));
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

  findFieldObject(savedField: { field: string; operator: string }): any {
    for (const g of this.groups) {
      for (const fg of g.groupFields) {
        for (const f of fg.fields) {
          if (f.field === savedField.field && f.operator === savedField.operator) {
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
}