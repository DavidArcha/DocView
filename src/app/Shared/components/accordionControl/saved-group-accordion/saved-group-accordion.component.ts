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
  // Add these two new outputs
  @Output() editGroupFieldTitle = new EventEmitter<SearchRequest>();
  @Output() deleteGroupFieldTitle = new EventEmitter<SearchRequest>();

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

  // Process incoming groups data with minimal transformation
  private processGroups(groups: any[]): any[] {
    if (!groups) return [];

    // Return cached result if input hasn't changed
    if (this.lastGroupsInput === groups && this.processedGroupsCache) {
      return this.processedGroupsCache;
    }

    // Process the groups, but keep the original structure as much as possible
    // Just ensure we have the necessary properties for rendering
    const result = groups.map(group => {
      // Create a shallow copy to avoid modifying the original
      const processedGroup = { ...group };

      // If we have groupTitle, use it, otherwise use title if available
      if (!processedGroup.groupTitle && processedGroup.title) {
        processedGroup.groupTitle = processedGroup.title;
      }

      // If still no groupTitle, create a default one
      if (!processedGroup.groupTitle) {
        processedGroup.groupTitle = {
          id: 'default-group',
          label: 'Saved Groups'
        };
      }

      // If we have groupFields, use it, otherwise use fields array directly
      if (!processedGroup.groupFields) {
        // Check if "fields" property exists and is an array
        if (Array.isArray(processedGroup.fields)) {
          // These are likely the individual search criteria items
          // We need to wrap them in a "groupField" structure for rendering
          processedGroup.groupFields = [{
            title: {
              id: 'default-field-group',
              label: 'Search Criteria'
            },
            fields: processedGroup.fields.map((field: any, index: number) => {
              // Add a unique ID for tracking
              return {
                ...field,
                _uniqueId: `field_default_${index}`
              };
            })
          }];
        } else {
          // Default to empty array if no fields found
          processedGroup.groupFields = [];
        }
      } else {
        // We already have groupFields, just ensure uniqueIds for fields
        processedGroup.groupFields = processedGroup.groupFields.map((fieldGroup: any, groupIndex: number) => {
          // Make a copy to avoid modifying original
          const processedFieldGroup = { ...fieldGroup };

          // Ensure title exists
          if (!processedFieldGroup.title) {
            processedFieldGroup.title = {
              id: `group-${groupIndex}`,
              label: `Group ${groupIndex + 1}`
            };
          }

          // Ensure fields array exists
          if (!Array.isArray(processedFieldGroup.fields)) {
            processedFieldGroup.fields = [];
          } else {
            // Add unique IDs to fields
            processedFieldGroup.fields = processedFieldGroup.fields.map((field: any, fieldIndex: number) => {
              return {
                ...field,
                _uniqueId: `field_${processedGroup.groupTitle?.id || 'default'}_${groupIndex}_${fieldIndex}`
              };
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
    if (!groupId) return; // Skip if invalid ID

    if (this.expandedGroups.has(groupId)) {
      this.expandedGroups.delete(groupId);
    } else {
      this.expandedGroups.add(groupId);
    }
    this.saveState();
    this.contextMenuVisible = false;
  }

  toggleField(fieldGroupId: string) {
    if (!fieldGroupId) return; // Skip if invalid ID

    if (this.expandedFields.has(fieldGroupId)) {
      this.expandedFields.delete(fieldGroupId);
    } else {
      this.expandedFields.add(fieldGroupId);
    }
    this.saveState();
    this.contextMenuVisible = false;
  }

  onFieldClick(field: SearchCriteria, event: Event): void {
    event.preventDefault();
    this.contextMenuVisible = false;
    this.selectedField = field;
    this.fieldSelected.emit(field);
    console.log('Field clicked:', field);
    this.saveState();
  }

  onGroupFieldTitleClick(fieldGroup: SearchRequest, event: Event): void {
    event.preventDefault();
    this.contextMenuVisible = false;
    console.log('On field group:', fieldGroup);
    this.groupFieldTitleClicked.emit(fieldGroup);
    this.saveState();
  }

  onGroupFieldTitleRightClick(event: MouseEvent, fieldGroup: any) {
    event.preventDefault();
    console.log('Right-click detected on field group:', fieldGroup);
    this.contextMenuVisible = true;
    // this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    // Position the context menu relative to the clicked element
    const rect = (event.target as HTMLElement).getBoundingClientRect();

    // Option 1: Position menu below the element
    this.contextMenuPosition = {
      x: rect.left,
      y: rect.bottom
    };
    this.selectedFieldGroup = fieldGroup;
  }

  onEditGroupFieldTitle() {
    if (this.selectedFieldGroup) {
      const title = this.selectedFieldGroup.title && typeof this.selectedFieldGroup.title === 'object'
        ? this.selectedFieldGroup.title.title || this.selectedFieldGroup.title.label
        : String(this.selectedFieldGroup.title || '');
      console.log('Edit Group Field Title:', title);

      // Emit the event with the selected group
      this.editGroupFieldTitle.emit(this.selectedFieldGroup);
    }
    this.contextMenuVisible = false;
  }

  onDeleteGroupFieldTitle() {
    if (this.selectedFieldGroup) {
      const title = this.selectedFieldGroup.title && typeof this.selectedFieldGroup.title === 'object'
        ? this.selectedFieldGroup.title.title || this.selectedFieldGroup.title.label
        : String(this.selectedFieldGroup.title || '');
      console.log('Delete Group Field Title:', title);

      // Emit the event with the selected group
      this.deleteGroupFieldTitle.emit(this.selectedFieldGroup);
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
    // If context menu isn't visible, no need to do anything
    if (!this.contextMenuVisible) return;

    // Get the context menu element
    const contextMenu = this.elementRef.nativeElement.querySelector('.context-menu');

    // Check if the click was outside the context menu
    if (contextMenu && !contextMenu.contains(event.target as Node)) {
      this.contextMenuVisible = false;
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  onDocumentRightClick(event: MouseEvent) {
    // Similar logic for right-click
    if (!this.contextMenuVisible) return;

    const contextMenu = this.elementRef.nativeElement.querySelector('.context-menu');
    if (contextMenu && !contextMenu.contains(event.target as Node)) {
      this.contextMenuVisible = false;
    }
  }

  /**
 * Reset the accordion to its initial state
 * Collapses all groups and clears selections
 */
  public reset(): void {
    // Clear expanded groups and fields
    this.expandedGroups.clear();
    this.expandedFields.clear();

    // Clear selected field
    this.selectedField = null;
    this.selectedFieldGroup = null;

    // Close any open context menu
    this.contextMenuVisible = false;

    // Remove saved state from localStorage
    localStorage.removeItem('savedAccordionState');
  }
}