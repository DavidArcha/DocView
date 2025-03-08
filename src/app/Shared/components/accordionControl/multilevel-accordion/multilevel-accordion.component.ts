import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AccordionItem } from '../../../interfaces/accordian-list.interface';

@Component({
  selector: 'app-multilevel-accordion',
  standalone: false,
  templateUrl: './multilevel-accordion.component.html',
  styleUrl: './multilevel-accordion.component.scss',
  // Performance optimization: using OnPush change detection strategy
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultilevelAccordionComponent {
  // The array of items for this level of the accordion
  @Input() items: AccordionItem[] = [];

  /**
   * The unique key of the parent item. For the top-level accordion, this is an empty string.
   * For nested accordions, it's the concatenation of all ancestor keys.
   */
  @Input() parentKey: string = '';

  /**
   * Determines whether we build our path/keys using the item.id or the item.label.
   * - 'id':  use item.id
   * - 'label': use item.label
   */
  @Input() pathMode: 'id' | 'label' = 'label';

  // Whether the search box is visible (only at the top level)
  @Input() isSearchItemVisible: boolean = false;

  /**
   * The unique key of the currently selected item (only one item can be selected at a time).
   * This is passed down recursively to child accordions so they know which item is selected overall.
   */
  @Input() selectedItemId: string | null = null;

  // Emitted when the user selects (clicks on) a different item
  @Output() selectedItemChange: EventEmitter<string> = new EventEmitter<string>();

  // The text entered by the user in the search box
  searchTerm: string = '';

  /**
   * Builds a unique key for the given item by combining the parentKey and
   * either the item's id or label (depending on pathMode).
   */
  getUniqueKey(item: AccordionItem): string {
    // Base part of the key is either the item's id or label
    const base = (this.pathMode === 'id') ? item.id : item.label;
    // If there's a parentKey, join it with the base. Otherwise, just use the base.
    return this.parentKey ? `${this.parentKey}|${base}` : base;
  }

  /**
   * Toggles the expansion (open/close) of an item when its caret is clicked.
   */
  toggleItem(item: AccordionItem): void {
    item.isOpen = !item.isOpen;
  }

  /**
   * Logs the item details and selects it (highlighting it).
   * We use the unique key rather than just item.id, so only one item can be highlighted.
   */
  logItem(item: AccordionItem): void {
    const uniqueKey = this.getUniqueKey(item);
    console.log({
      id: item.id,
      label: item.label,
      uniqueKey
    });
    // Mark this item as selected
    this.selectedItemId = uniqueKey;
    // Notify any parent component that a new item is selected
    this.selectedItemChange.emit(uniqueKey);
  }

  /**
   * Recursively filters items based on the search term (case-insensitive).
   * If there's no search term, we return the full list.
   */
  filterItems(items: AccordionItem[], term: string): AccordionItem[] {
    if (!term) return items;
    const lowerTerm = term.toLowerCase();
    return items.reduce((acc: AccordionItem[], item: AccordionItem) => {
      const filteredChildren = this.filterItems(item.children, term);
      const isMatch = item.label.toLowerCase().includes(lowerTerm);
      if (isMatch || filteredChildren.length > 0) {
        acc.push({
          ...item,
          children: filteredChildren,
          // Expand if children match
          isOpen: filteredChildren.length > 0
        });
      }
      return acc;
    }, []);
  }

  /**
   * The items displayed in the template (either the full list or filtered by the searchTerm).
   */
  get displayedItems(): AccordionItem[] {
    return this.searchTerm ? this.filterItems(this.items, this.searchTerm) : this.items;
  }

  // Clears the search box
  clearSearch(): void {
    this.searchTerm = '';
  }

  /**
   * trackBy function for improved performance in *ngFor loops
   */
  trackByFn(index: number, item: AccordionItem): string {
    // We can just return item.id or this.getUniqueKey(item).
    // For large data sets, this helps Angular minimize re-renders.
    return item.id;
  }

  /**
   * Keyboard support for caret icon: toggle expansion on Enter or Space.
   */
  onCaretKeydown(event: KeyboardEvent, item: AccordionItem): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleItem(item);
    }
  }

  /**
   * Keyboard support for label: select (log) the item on Enter or Space.
   */
  onLabelKeydown(event: KeyboardEvent, item: AccordionItem): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.logItem(item);
    }
  }
}