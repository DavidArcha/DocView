import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pagination-control',
  standalone: false,
  templateUrl: './pagination-control.component.html',
  styleUrls: ['./pagination-control.component.scss']
})
export class PaginationControlComponent implements OnChanges {
  @Input() totalRecords = 0;
  @Input() pageSize = 25;
  @Input() currentPage = 1;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100]; // Make customizable

  @Output() pageChanged = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges): void {
    // Validate and clamp inputs whenever they change
    if (changes['totalRecords'] || changes['pageSize'] || changes['currentPage']) {
      this.validateInputs();
    }
  }

  private validateInputs(): void {
    // Ensure totalRecords is non-negative
    if (this.totalRecords < 0) {
      this.totalRecords = 0;
    }

    // Ensure pageSize is at least 1
    if (this.pageSize < 1) {
      this.pageSize = 1;
    }

    // Ensure pageSizeOptions has valid values
    if (!this.pageSizeOptions || this.pageSizeOptions.length === 0) {
      this.pageSizeOptions = [10, 25, 50, 100];
    }

    // Calculate total pages after validating pageSize
    const totalPages = this.totalPages;

    // Ensure currentPage is within valid range
    if (this.currentPage < 1) {
      this.currentPage = 1;
    } else if (this.currentPage > totalPages && totalPages > 0) {
      this.currentPage = totalPages;
    }
  }

  get totalPages(): number {
    return this.totalRecords > 0 ? Math.ceil(this.totalRecords / this.pageSize) : 0;
  }

  get pages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 10) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', total);
      } else if (current >= total - 3) {
        pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total);
      }
    }

    return pages;
  }

  get endRecord(): number {
    if (this.totalRecords === 0) return 0;
    const potentialEnd = this.currentPage * this.pageSize;
    return potentialEnd > this.totalRecords ? this.totalRecords : potentialEnd;
  }

  get startRecord(): number {
    return this.totalRecords === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get hasRecords(): boolean {
    return this.totalRecords > 0;
  }

  /**
   * Emits zero-based page index for consistency.
   */
  goToPage(page: number | string): void {
    if (typeof page === 'number' && page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChanged.emit(this.currentPage - 1); // Emit zero-based index
    }
  }

  goToFirst(): void {
    if (this.currentPage !== 1 && this.hasRecords) {
      this.currentPage = 1;
      this.pageChanged.emit(this.currentPage - 1); // Emit zero-based index
    }
  }

  goToPrevious(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.pageChanged.emit(this.currentPage - 1); // Emit zero-based index
    }
  }

  goToNext(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.pageChanged.emit(this.currentPage - 1); // Emit zero-based index
    }
  }

  goToLast(): void {
    if (this.totalPages > 0 && this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.pageChanged.emit(this.currentPage - 1); // Emit zero-based index
    }
  }

  onPageSizeChange(event: Event): void {
    const newSize = +(event.target as HTMLSelectElement).value;
    
    // Validate the new size
    if (newSize < 1) return;
    
    this.pageSize = newSize;
    
    // Keep the current page number, but ensure it doesn't exceed the new total pages
    const newTotalPages = this.totalPages;
    if (this.currentPage > newTotalPages && newTotalPages > 0) {
      this.currentPage = newTotalPages;
    }
    
    // Emit the events
    this.pageSizeChanged.emit(this.pageSize);
    this.pageChanged.emit(this.currentPage - 1); // emit zero-based page index
  }

  trackByFn(index: number, item: number | string): number | string {
    return item;
  }
}
