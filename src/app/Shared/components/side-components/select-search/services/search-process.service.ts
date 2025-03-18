import { Injectable } from '@angular/core';
import { SearchService } from '../../../../services/search.service';
import { SearchRequest } from '../../../../interfaces/search-request.interface';
import { Subject, takeUntil } from 'rxjs';
import { SearchCriteriaService } from './search-criteria.service';

@Injectable({
  providedIn: 'root'
})
export class SearchProcessService {

  private destroy$ = new Subject<void>();
  public hasError: boolean = false;
  public errorMessage: string = '';
  constructor(
    private searchService: SearchService,
    private searchCriteriaService: SearchCriteriaService,
  ) {
  }


  // Helper method to save the search request (e.g., to backend API)
  saveSearchRequest(searchRequest: SearchRequest): void {
    // Call your search service API
    this.searchService.saveSearchRequest(searchRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Reload saved searches via the service instead of updating the array directly
          this.searchCriteriaService.loadAllSavedSearches();
        },
        error: (error) => {
          this.hasError = true;
          this.errorMessage = 'Failed to save search. Please try again.';
        }
      });

    // For now, use the existing searchCriteriaService to save locally
    this.searchCriteriaService.saveCustomSearchRequest(searchRequest);
  }


  /**
   * Extract field object from various input formats
   * @param item - The item from which to extract field data
   * @returns Field object or null if invalid
   */
  extractFieldFromItem(item: any): { id: string, label: string } | null {
    if (!item) return null;

    // Handle different item formats
    if (item.field) {
      return {
        id: item.field.id,
        label: item.field.label
      };
    } else if (item.item) {
      return {
        id: item.item.id,
        label: item.item.label
      };
    } else if (item.id) {
      return {
        id: item.id,
        label: item.label || item.id
      };
    }

    return null;
  }
  

}
