import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-saved-group-accordion',
  standalone: false,
  templateUrl: './saved-group-accordion.component.html',
  styleUrl: './saved-group-accordion.component.scss'
})
export class SavedGroupAccordionComponent implements OnInit {
  @Input() groups: any[] = [];
  // Receive the currently selected field from the parent
  @Input() selectedField: any = null;
  // Emit when a field is clicked in the accordion
  @Output() fieldSelected = new EventEmitter<any>();
  // Optional: emit when a field group title is clicked
  @Output() groupFieldTitleClicked = new EventEmitter<any>();

  expandedGroups: Set<string> = new Set();
  expandedFields: Set<string> = new Set();
  selectedFieldGroup: any = null;

  contextMenuVisible: boolean = false;
  contextMenuPosition = { x: 0, y: 0 };

  ngOnInit() {
    this.restoreState();
  }

  toggleGroup(groupTitle: string) {
    if (this.expandedGroups.has(groupTitle)) {
      this.expandedGroups.delete(groupTitle);
    } else {
      this.expandedGroups.add(groupTitle);
    }
    this.saveState();
  }

  toggleField(fieldGroupTitle: string) {
    if (this.expandedFields.has(fieldGroupTitle)) {
      this.expandedFields.delete(fieldGroupTitle);
    } else {
      this.expandedFields.add(fieldGroupTitle);
    }
    this.saveState();
  }

  // When a field title is clicked, notify the parent
  onFieldClick(field: any, event: Event): void {
    event.preventDefault();
    this.selectedField = field;
    this.fieldSelected.emit(field);
    this.saveState();
  }
  // Optionally, when a group field title is clicked
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
      console.log('Edit Group Field Title:', this.selectedFieldGroup.title);
    }
    this.contextMenuVisible = false;
  }

  onDeleteGroupFieldTitle() {
    if (this.selectedFieldGroup) {
      console.log('Delete Group Field Title:', this.selectedFieldGroup.title);
    }
    this.contextMenuVisible = false;
  }

  onGroupRightClick(event: MouseEvent, group: any) {
    event.preventDefault();
    console.log('Right-click on:', group.title);
  }

  // Save the current state (expanded groups, expanded fields, selected field) to localStorage
  saveState() {
    const state = {
      expandedGroups: Array.from(this.expandedGroups),
      expandedFields: Array.from(this.expandedFields),
      selectedField: this.selectedField
        ? {
          // If needed, store just enough to identify it, e.g. field name
          field: this.selectedField.field,
          operator: this.selectedField.operator
        }
        : null
    };
    localStorage.setItem('savedAccordionState', JSON.stringify(state));
  }

  // Restore from localStorage
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
          // Re-match the actual field object, or store as-is if you only need the highlight
          this.selectedField = this.findFieldObject(parsed.selectedField);
        }
      } catch (err) {
        console.error('Error restoring state', err);
      }
    }
  }

  // (Optional) If you need the *exact* field object from your array, 
  // do a lookup in `groups` to find it. 
  // For example:
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
    // If not found, just return the raw object
    return savedField;
  }

  clearSelectedField(): void {
    this.selectedField = null;
    this.saveState();
  }
}