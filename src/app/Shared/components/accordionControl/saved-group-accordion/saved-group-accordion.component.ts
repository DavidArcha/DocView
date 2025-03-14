import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { DropdownItem } from '../../../interfaces/table-dropdown.interface';
import { SearchCriteria } from '../../../interfaces/search-criteria.interface';
import { SearchRequest } from '../../../interfaces/search-request.interface';

// This interface is still needed as it represents the unique identifier structure
interface FieldIdentifier {
  uniqueId?: string;
  fieldId?: string;
  operatorId?: string;
  value?: any;
  field?: string;
  operator?: string;
}

// This state interface is essential for storing accordion state
interface AccordionState {
  expandedGroups: string[];
  expandedFields: string[];
  selectedField: FieldIdentifier | null;
}

@Component({
  selector: 'app-saved-group-accordion',
  standalone: false,
  templateUrl: './saved-group-accordion.component.html',
  styleUrl: './saved-group-accordion.component.scss'
})
export class SavedGroupAccordionComponent implements OnInit, OnDestroy {
  @Input() set groups(value: SearchRequest[] | any[]) {
    this._groups = this.processGroups(value);
  }

  get groups(): any[] {
    return this._groups;
  }

  private _groups: any[] = [];
  @Input() selectedField: SearchCriteria | any = null;
  @Output() fieldSelected = new EventEmitter<SearchCriteria>();
  @Output() groupFieldTitleClicked = new EventEmitter<SearchRequest>();

  expandedGroups: Set<string> = new Set();
  expandedFields: Set<string> = new Set();
  selectedFieldGroup: any = null;

  contextMenuVisible: boolean = false;
  contextMenuPosition = { x: 0, y: 0 };

  // Performance optimization variables
  private debounceTimer: any;
  private saveStateTimer: any;
  private lastGroupsInput: any[] | null = null;
  private processedGroupsCache: any[] | null = null;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.restoreState();
  }

  ngOnDestroy() {
    clearTimeout(this.debounceTimer);
    clearTimeout(this.saveStateTimer);
    this.lastGroupsInput = null;
    this.processedGroupsCache = null;
  }

  // Process incoming groups data and add unique IDs with memoization
  private processGroups(groups: any[]): any[] {
    if (!groups) return [];

    // Return cached result if input hasn't changed
    if (this.lastGroupsInput === groups && this.processedGroupsCache) {
      return this.processedGroupsCache;
    }

    const result = groups.map(group => {
      const processedGroup = { ...group };
      if (processedGroup.groupFields) {
        processedGroup.groupFields = processedGroup.groupFields.map((fieldGroup: any, fgIndex: number) => {
          const processedFieldGroup = { ...fieldGroup };
          if (processedFieldGroup.fields) {
            processedFieldGroup.fields = processedFieldGroup.fields.map((field: any, fIndex: number) => {
              const uniqueId = `field_${group.groupTitle?.id || ''}_${fieldGroup.title?.id || fgIndex}_${fIndex}`;
              return { ...field, _uniqueId: uniqueId };
            });
          }
          return processedFieldGroup;
        });
      }
      return processedGroup;
    });

    // Cache results
    this.lastGroupsInput = groups;
    this.processedGroupsCache = result;

    return result;
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

  onFieldClick(field: SearchCriteria, event: Event): void {
    event.preventDefault();
    this.selectedField = field;
    this.fieldSelected.emit(field);
    console.log('Field clicked:', field);
    this.saveState();
  }

  onGroupFieldTitleClick(fieldGroup: SearchRequest, event: Event): void {
    event.preventDefault();
    console.log('On field group:', fieldGroup);
    this.groupFieldTitleClicked.emit(fieldGroup);
    this.saveState();
  }

  onGroupFieldTitleRightClick(event: MouseEvent, fieldGroup: any) {
    event.preventDefault();
    console.log('Right-click detected on field group:', fieldGroup);
    this.contextMenuVisible = true;
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.selectedFieldGroup = fieldGroup;
  }

  onEditGroupFieldTitle() {
    if (this.selectedFieldGroup) {
      const title = this.selectedFieldGroup.title && typeof this.selectedFieldGroup.title === 'object'
        ? this.selectedFieldGroup.title.title || this.selectedFieldGroup.title.label
        : String(this.selectedFieldGroup.title || '');
      console.log('Edit Group Field Title:', title);
    }
    this.contextMenuVisible = false;
  }

  onDeleteGroupFieldTitle() {
    if (this.selectedFieldGroup) {
      const title = this.selectedFieldGroup.title && typeof this.selectedFieldGroup.title === 'object'
        ? this.selectedFieldGroup.title.title || this.selectedFieldGroup.title.label
        : String(this.selectedFieldGroup.title || '');
      console.log('Delete Group Field Title:', title);
    }
    this.contextMenuVisible = false;
  }

  onGroupRightClick(event: MouseEvent, group: any) {
    event.preventDefault();
    console.log('Right-click on:', group.groupTitle?.title);
  }

  getFieldTitle(field: SearchCriteria | any): string {
    if (!field) return '';

    if (field.field && typeof field.field === 'object' &&
      field.operator && typeof field.operator === 'object') {
      return `${field.field.label || ''} ${field.operator.label || ''} ${field.value || ''}`;
    } else if (typeof field.field === 'string' && typeof field.operator === 'string') {
      return `${field.field} ${field.operator} ${field.value || ''}`;
    }
    return '';
  }

  getFieldLabel(field: SearchCriteria | any): string {
    if (!field) return '';

    if (field.field && typeof field.field === 'object' &&
      field.operator && typeof field.operator === 'object') {
      return `${field.field.label || ''} ${field.operator.label || ''} ${field.value || ''}`;
    } else if (typeof field.field === 'string' && typeof field.operator === 'string') {
      return `${field.field} ${field.operator} ${field.value || ''}`;
    }
    return field.id || '';
  }

  isFieldSelected(field: SearchCriteria | any): boolean {
    if (!this.selectedField || !field) return false;

    // Use the unique ID for comparison if available - most efficient check
    if (field._uniqueId && this.selectedField._uniqueId) {
      return field._uniqueId === this.selectedField._uniqueId;
    }

    // Fall back to checking object properties
    const isMatchById = field.field?.id && this.selectedField.field?.id &&
      field.field.id === this.selectedField.field.id &&
      field.operator?.id === this.selectedField.operator?.id &&
      field.value === this.selectedField.value;

    if (isMatchById) return true;

    const isMatchBySimpleId = field.id && this.selectedField.id &&
      field.id === this.selectedField.id;

    if (isMatchBySimpleId) return true;

    // Last resort, direct reference comparison
    return field === this.selectedField;
  }

  saveState() {
    // Clear any pending save operation
    clearTimeout(this.saveStateTimer);

    // Debounce save operations to avoid excessive localStorage writes
    this.saveStateTimer = setTimeout(() => {
      const state: AccordionState = {
        expandedGroups: Array.from(this.expandedGroups),
        expandedFields: Array.from(this.expandedFields),
        selectedField: this.selectedField
          ? this.getSelectedFieldIdentifier(this.selectedField)
          : null
      };

      try {
        const stateJson = JSON.stringify(state);
        localStorage.setItem('savedAccordionState', stateJson);
      } catch (err) {
        console.error('Error saving accordion state:', err);
      }
    }, 300);
  }

  getSelectedFieldIdentifier(field: SearchCriteria | any): FieldIdentifier {
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
        const parsed = JSON.parse(stored) as AccordionState;
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

  findFieldObject(savedField: FieldIdentifier): any {
    if (!this.groups || !savedField) return savedField;

    // Try to find by unique ID first if available
    if (savedField.uniqueId) {
      for (const g of this.groups) {
        for (const fg of g.groupFields || []) {
          for (const f of fg.fields || []) {
            if (f._uniqueId === savedField.uniqueId) {
              return f;
            }
          }
        }
      }
    }

    // Fall back to previous field finding logic
    for (const g of this.groups) {
      for (const fg of g.groupFields || []) {
        for (const f of fg.fields || []) {
          const fieldIdMatch = savedField.fieldId && f.field?.id === savedField.fieldId &&
            (!savedField.operatorId || f.operator?.id === savedField.operatorId) &&
            (!savedField.value || f.value === savedField.value);

          if (fieldIdMatch) return f;

          const fieldLabelMatch = savedField.field &&
            ((typeof f.field === 'string' && f.field === savedField.field) ||
              (f.field?.label === savedField.field)) &&
            ((typeof f.operator === 'string' && f.operator === savedField.operator) ||
              (f.operator?.label === savedField.operator)) &&
            (!savedField.value || f.value === savedField.value);

          if (fieldLabelMatch) return f;
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
    // Improved event handling with proper type checking
    if (!this.contextMenuVisible) return;

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.contextMenuVisible = false;
      }
    }, 50);
  }

  @HostListener('document:contextmenu', ['$event'])
  onDocumentRightClick(event: MouseEvent) {
    if (!this.contextMenuVisible) return;

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.contextMenuVisible = false;
      }
    }, 50);
  }
}