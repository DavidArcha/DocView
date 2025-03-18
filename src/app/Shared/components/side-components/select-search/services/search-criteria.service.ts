import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { SelectedField } from '../../../../interfaces/selectedFields.interface';
import { SearchCriteria } from '../../../../interfaces/search-criteria.interface';
import { SearchRequest } from '../../../../interfaces/search-request.interface';
import { StorageService } from './storage.service';
import { SelectionService } from './selection.service';
import { updatedSearchGroupFields } from '../../../../common/updatedsearch_groupfields';
import { SearchService } from '../../../../services/search.service';

@Injectable({
  providedIn: 'root'
})
export class SearchCriteriaService {
  private savedGroupFieldsSubject = new BehaviorSubject<SearchRequest[]>([]);
  public savedGroupFields$ = this.savedGroupFieldsSubject.asObservable();

  constructor(
    private storageService: StorageService,
    private selectionService: SelectionService,
    private searchService: SearchService,
  ) {
    this.loadAllSavedSearches();
  }

  // Method to load all saved searches from the API
  loadAllSavedSearches(): void {
    this.searchService.getAllSavedSearches()
      .pipe(
        map(response => {
          // Transform the data similar to your component code
          let transformedData: any[] = [];

          if (response && response.groupTitle && response.groupFields) {
            // Deep clone the response to avoid reference issues
            const clonedResponse = JSON.parse(JSON.stringify(response));

            // Normalize the groupFields data, checking each field
            if (clonedResponse.groupFields && Array.isArray(clonedResponse.groupFields)) {
              clonedResponse.groupFields.forEach((group: any) => {
                if (group.fields && Array.isArray(group.fields)) {
                  group.fields.forEach((field: any) => {
                    // Ensure parent property is correctly formatted
                    if (field.parent) {
                      // If parent is not an array but should be (based on model)
                      if (!Array.isArray(field.parent) && typeof field.parent === 'object') {
                        // Ensure id is the right type (convert string to number if needed)
                        if (field.parent.id && typeof field.parent.id === 'string' && !isNaN(Number(field.parent.id))) {
                          field.parent.id = Number(field.parent.id);
                        }
                      }
                      // If parent is array, ensure each item is formatted correctly
                      else if (Array.isArray(field.parent)) {
                        field.parent.forEach((parent: any) => {
                          if (parent.id && typeof parent.id === 'string' && !isNaN(Number(parent.id))) {
                            parent.id = Number(parent.id);
                          }
                        });
                      }
                    }

                    // Similar logic for field IDs if needed
                    if (field.field && field.field.id && typeof field.field.id === 'string' && !isNaN(Number(field.field.id))) {
                      field.field.id = Number(field.field.id);
                    }

                    // Ensure rowId exists (even if empty)
                    if (!field.hasOwnProperty('rowId')) {
                      field.rowId = "";
                    }
                  });
                }
              });
            }

            transformedData = [clonedResponse];
          } else if (Array.isArray(response)) {
            // Already an array, but still normalize the data
            transformedData = JSON.parse(JSON.stringify(response));
            // Apply same normalization as above...
          }

          return transformedData;
        })
      )
      .subscribe({
        next: (savedSearches) => {
          this.savedGroupFieldsSubject.next(savedSearches);
        },
        error: (err) => {
          console.error('Failed to load saved searches', err);
          // You could emit an empty array or keep the current value
          // depending on your error handling strategy
        }
      });
  }

  /**
   * Loads saved group fields from local storage or defaults to hardcoded data
   */
  private loadSavedGroupFieldsFromStorage(): void {

    const stored = this.storageService.getItem('savedGroupFields');
    if (stored) {
      try {
        const parsedGroups = JSON.parse(stored) as SearchRequest[];
        console.log('Successfully parsed stored groups, count:', parsedGroups.length);
        this.savedGroupFieldsSubject.next(parsedGroups);
      } catch (e) {
        console.error('Error parsing saved groups:', e);
        // If there's an error parsing the stored data, 
        // initialize with the hardcoded data
        this.loadDefaultGroups();
      }
    } else {
      // If nothing in storage, initialize with the hardcoded data
      this.loadDefaultGroups();
    }
  }

  /**
   * Load default groups from the hardcoded data
   */
  private loadDefaultGroups(): void {
    // Make sure the data is imported
    if (!updatedSearchGroupFields) {
      console.error('updatedSearchGroupFields is not defined! Check import.');
      this.savedGroupFieldsSubject.next([]);
      return;
    }

    if (updatedSearchGroupFields.length > 0) {

      try {
        // The hardcoded data structure has a single outer container with groupFields
        if (updatedSearchGroupFields[0].groupFields && Array.isArray(updatedSearchGroupFields[0].groupFields)) {
          // These are already in the format we need, just map them to ensure proper typing
          const groupRequestsFromData = updatedSearchGroupFields[0].groupFields.map(groupField => {
            return {
              title: {
                id: groupField.title?.id?.toString() || this.generateUniqueId(),
                label: groupField.title?.label || 'Unnamed Group'
              },
              fields: this.mapFieldsToSearchCriteria(groupField.fields || [])
            } as SearchRequest;
          });
          this.savedGroupFieldsSubject.next(groupRequestsFromData);

          // Also save to storage so they persist
          this.storageService.setItem('savedGroupFields', JSON.stringify(groupRequestsFromData));
          return;
        }

        // Fallback approach if the structure is different
        const defaultGroups: SearchRequest[] = updatedSearchGroupFields.map(group => {
          return {
            title: {
              id: group.groupTitle?.id?.toString() || this.generateUniqueId(),
              label: group.groupTitle?.label || 'Default Group'
            },
            fields: [] // Empty fields array as we don't have direct fields at this level
          };
        });

        this.savedGroupFieldsSubject.next(defaultGroups);
        this.storageService.setItem('savedGroupFields', JSON.stringify(defaultGroups));
      } catch (error) {
        console.error('Error mapping default groups:', error);
        this.savedGroupFieldsSubject.next([]);
      }
    } else {
      this.savedGroupFieldsSubject.next([]);
    }
  }
  /**
   * Maps fields from the updatedSearchGroupFields format to SearchCriteria format
   * @param fields - The fields from the hardcoded data
   */
  private mapFieldsToSearchCriteria(fields: any[]): SearchCriteria[] {
    if (!fields || !Array.isArray(fields)) return [];

    return fields
      .filter(field => field && field.field && field.field.id) // Filter out entries with missing field data
      .map(field => {
        // Map parent value, ensuring it's the correct type
        let parentValue: any = { id: '', label: '' }; // Default to empty object instead of null

        if (field.parent) {
          if (Array.isArray(field.parent)) {
            // Convert array of parents to array of DropdownItems
            parentValue = field.parent.map((p: any) => ({
              id: (p.id || '').toString(), // Ensure id is a string
              label: p.label || ''
            }));
          } else {
            // Convert single parent to DropdownItem
            parentValue = {
              id: (field.parent.id || '').toString(), // Ensure id is a string
              label: field.parent.label || ''
            };
          }
        }

        // Map field value - ensure it's never null by providing a default
        const fieldValue = {
          id: field.field?.id?.toString() || '',
          label: field.field?.label || ''
        };

        // Map operator value - ensure it's never null by providing a default
        const operatorValue = {
          id: field.operator?.id?.toString() || 'equals', // Default to 'equals' operator
          label: field.operator?.label || 'Equals'
        };

        // Create the SearchCriteria object with required fields
        return {
          rowId: field.rowId || this.generateUniqueId(),
          parent: parentValue,
          field: fieldValue, // Now guaranteed to be non-null
          operator: operatorValue, // Now guaranteed to be non-null
          value: field.value !== undefined ? field.value : '',
          valueType: field.valueType || ''
        } as SearchCriteria;
      });
  }

  /**
   * Gets saved group fields
   */
  getSavedGroupFields(): SearchRequest[] {
    return this.savedGroupFieldsSubject.getValue();
  }

  /**
   * Creates a search request from current fields
   */
  createSearchRequest(title?: string): SearchRequest | null {
    const fields = this.selectionService.selectedFields;

    if (fields.length === 0) {
      return null;
    }

    // Validate all fields
    const invalidFields = fields.filter(field =>
      !field.operator ||
      field.operator.id === 'select' ||
      (field.value === null && field.operator.id !== 'empty' && field.operator.id !== 'not_empty')
    );

    if (invalidFields.length > 0) {
      return null;
    }

    // Convert to search criteria
    const searchCriteria = this.selectionService.convertSelectedFieldsToSearchCriteria(fields);

    // Create the search request
    return {
      title: {
        id: '',
        label: title || 'Search Request'
      },
      fields: searchCriteria
    };
  }

  /**
 * Save a custom search request directly
 * @param searchRequest - The complete search request to save
 */
  saveCustomSearchRequest(searchRequest: SearchRequest): void {
    if (!searchRequest || !searchRequest.fields || searchRequest.fields.length === 0) {
      return;
    }

    let savedGroups = this.getSavedGroupFields();

    // Add as a new group
    savedGroups = [...savedGroups, searchRequest];

    // Save to store and localStorage
    this.savedGroupFieldsSubject.next(savedGroups);
    this.storageService.setItem('savedGroupFields', JSON.stringify(savedGroups));
  }

  /**
   * Save a search group
   * @param name - Name of the search group
   * @param isEditMode - Whether we're editing an existing group or creating new
   * @param currentGroupField - The current group being edited (if in edit mode)
   */
  saveSearchGroup(name: string, isEditMode: boolean = false, currentGroupField: SearchRequest | null = null): void {
    console.log('Saving search group initial data:', name, isEditMode, currentGroupField);
    const searchRequest = this.createSearchRequest(name);
    if (!searchRequest) {
      return;
    }
    let savedGroups = this.getSavedGroupFields();
    console.log('Saved groups before save:', savedGroups);

    // Handle edit mode
    if (isEditMode && currentGroupField && currentGroupField.title) {
      // Preserve the ID of the existing group
      searchRequest.title.id = currentGroupField.title.id;

      // Replace the existing group
      savedGroups = savedGroups.map(group =>
        group.title.id === currentGroupField.title.id ? searchRequest : group
      );
    } else {
      // Add as a new group
      savedGroups = [...savedGroups, searchRequest];
    }
    console.log('Saved groups after save:', savedGroups);
    // Save to store and localStorage
    this.savedGroupFieldsSubject.next(savedGroups);
    this.storageService.setItem('savedGroupFields', JSON.stringify(savedGroups));
  }

  /**
   * Delete a saved search group
   */
  deleteSearchGroup(groupField: SearchRequest): void {
    if (!groupField || !groupField.title || !groupField.title.id) {
      return;
    }

    const savedGroups = this.getSavedGroupFields();
    const updatedGroups = savedGroups.filter(group =>
      group.title.id !== groupField.title.id
    );

    this.savedGroupFieldsSubject.next(updatedGroups);
    this.storageService.setItem('savedGroupFields', JSON.stringify(updatedGroups));
  }

  /**
   * Generate a unique ID for search groups
   */
  private generateUniqueId(): string {
    return 'search_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
  }
}