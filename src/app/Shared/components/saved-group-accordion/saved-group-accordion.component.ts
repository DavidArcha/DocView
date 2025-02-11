import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-saved-group-accordion',
  standalone: false,
  templateUrl: './saved-group-accordion.component.html',
  styleUrl: './saved-group-accordion.component.scss'
})
export class SavedGroupAccordionComponent {
  @Input() groups: any[] = [];
  @Output() fieldSelected = new EventEmitter<any>();
  @Output() groupFieldTitleClicked = new EventEmitter<any>(); // Add this line

  expandedGroups: Set<string> = new Set();
  expandedFields: Set<string> = new Set();

  contextMenuVisible: boolean = false;
  contextMenuPosition = { x: 0, y: 0 };
  selectedFieldGroup: any = null;

  toggleGroup(title: string) {
    if (this.expandedGroups.has(title)) {
      this.expandedGroups.delete(title);
    } else {
      this.expandedGroups.add(title);
    }
  }

  toggleField(title: string) {
    if (this.expandedFields.has(title)) {
      this.expandedFields.delete(title);
    } else {
      this.expandedFields.add(title);
    }
  }

  onFieldClick(field: any) {
    this.fieldSelected.emit(field);
    console.log('Selected Field:', field);
  }

  onGroupFieldTitleClick(fieldGroup: any) {
    console.log('Fields in Group:', fieldGroup.fields);
    this.groupFieldTitleClicked.emit(fieldGroup.fields); // Emit the fields array
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
}