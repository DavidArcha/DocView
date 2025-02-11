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

  expandedGroups: Set<string> = new Set();
  expandedFields: Set<string> = new Set();

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
  }

  onGroupRightClick(event: MouseEvent, group: any) {
    event.preventDefault();
    console.log('Right-click on:', group.title);
  }
}