import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AccordionSection } from '../../common/accordion-section.model';
import { accordionDataTypes } from '../../common/accordian';
import { delay, Observable, of } from 'rxjs';
import { AccordionItem } from '../../interfaces/accordian-list.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-multilevel-accordion',
  standalone: false,
  templateUrl: './multilevel-accordion.component.html',
  styleUrl: './multilevel-accordion.component.scss',
  // Performance optimization: using OnPush change detection strategy
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultilevelAccordionComponent {
  // The accordion data
  @Input() items: AccordionItem[] = [];
  // Parent path string to build the full path (for nested accordions)
  @Input() parentPath: string = '';
  // Choose whether the path is built using the item's id or label
  @Input() pathMode: 'id' | 'label' = 'label';
  // Controls the visibility of the search textbox at the top level
  @Input() isSearchItemVisible: boolean = false;

  // Search term entered by the user
  searchTerm: string = '';

  // Toggle the expansion state when the caret icon is clicked.
  // This is only used for items that have children.
  toggleItem(item: AccordionItem): void {
    item.isOpen = !item.isOpen;
  }

  // Log the item details (id, label, and computed path) when the label is clicked.
  logItem(item: AccordionItem): void {
    const currentValue = this.pathMode === 'id' ? item.id : item.label;
    const fullPath = this.parentPath ? `${this.parentPath}|${currentValue}` : currentValue;
    console.log({ id: item.id, label: item.label, path: fullPath });
  }

  // Recursively filter items based on the search term.
  // This logic is kept inside the component for modularity,
  // but it can be extracted into a separate service if needed.
  filterItems(items: AccordionItem[], term: string): AccordionItem[] {
    if (!term) return items;
    try {
      return items.reduce((acc: AccordionItem[], item: AccordionItem) => {
        const lowerTerm = term.toLowerCase();
        // Filter children recursively
        const filteredChildren = this.filterItems(item.children, term);
        // Check if current item's label contains the search term
        const isMatch = item.label.toLowerCase().includes(lowerTerm);
        // Include the item if it matches or if any of its children match.
        if (isMatch || filteredChildren.length > 0) {
          const newItem: AccordionItem = {
            ...item,
            children: filteredChildren,
            // Auto-expand if there are matching children
            isOpen: filteredChildren.length > 0
          };
          acc.push(newItem);
        }
        return acc;
      }, []);
    } catch (error) {
      console.error('Error filtering items:', error);
      return [];
    }
  }

  // Return filtered items if a search term is provided; otherwise, return the original items.
  get displayedItems(): AccordionItem[] {
    return this.searchTerm ? this.filterItems(this.items, this.searchTerm) : this.items;
  }

  // Clear the search term (used by the clear button).
  clearSearch(): void {
    this.searchTerm = '';
  }

  // Since color highlighting is not required, we simply return the label.
  getLabel(label: string): string {
    return label;
  }

  // trackBy function for improved performance in ngFor loops.
  trackByFn(index: number, item: AccordionItem): string {
    return item.id;
  }

  // Enable keyboard support for the caret icon: toggle on Enter or Space.
  onCaretKeydown(event: KeyboardEvent, item: AccordionItem): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleItem(item);
    }
  }

  // Enable keyboard support for the label: log details on Enter or Space.
  onLabelKeydown(event: KeyboardEvent, item: AccordionItem): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.logItem(item);
    }
  }
}