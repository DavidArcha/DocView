import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-saved-group-accordion',
  standalone: false,
  templateUrl: './saved-group-accordion.component.html',
  styleUrl: './saved-group-accordion.component.scss'
})
export class SavedGroupAccordionComponent implements OnInit {
  @Input() groups: any[] = [];
  @Output() fieldSelected = new EventEmitter<any>();
  @Output() groupFieldTitleClicked = new EventEmitter<any>();

  expandedGroups: Set<string> = new Set();
  expandedFields: Set<string> = new Set();
  selectedFieldGroup: any = null;
  selectedField: any = null;

  contextMenuVisible: boolean = false;
  contextMenuPosition = { x: 0, y: 0 };

  ngOnInit() {
    this.restoreState();
  }

  toggleGroup(title: string) {
    if (this.expandedGroups.has(title)) {
      this.expandedGroups.delete(title);
    } else {
      this.expandedGroups.add(title);
    }
    this.saveState();
  }

  toggleField(title: string) {
    if (this.expandedFields.has(title)) {
      this.expandedFields.delete(title);
    } else {
      this.expandedFields.add(title);
    }
    this.saveState();
  }

  onFieldClick(field: any) {
    this.selectedField = field;
    this.fieldSelected.emit(field);
    this.saveState();
  }

  onGroupFieldTitleClick(fieldGroup: any) {
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

  private saveState() {
    const state = {
      expandedGroups: Array.from(this.expandedGroups),
      expandedFields: Array.from(this.expandedFields),
      selectedFieldGroup: this.selectedFieldGroup,
      selectedField: this.selectedField
    };
    localStorage.setItem('savedGroupAccordionState', JSON.stringify(state));
  }

  private restoreState() {
    const state = localStorage.getItem('savedGroupAccordionState');
    if (state) {
      const parsedState = JSON.parse(state);
      this.expandedGroups = new Set(parsedState.expandedGroups);
      this.expandedFields = new Set(parsedState.expandedFields);
      this.selectedFieldGroup = parsedState.selectedFieldGroup;
      this.selectedField = parsedState.selectedField;
    }
  }
}