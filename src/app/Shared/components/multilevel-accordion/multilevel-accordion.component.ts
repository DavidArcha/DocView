import { Component, Input, OnInit } from '@angular/core';
import { AccordionSection } from '../../common/accordion-section.model';
import { accordionDataTypes } from '../../common/accordian';
import { delay, Observable, of } from 'rxjs';
import { AccordionItem } from '../../interfaces/accordian-list.interface';

@Component({
  selector: 'app-multilevel-accordion',
  standalone: false,
  templateUrl: './multilevel-accordion.component.html',
  styleUrl: './multilevel-accordion.component.scss'
})
export class MultilevelAccordionComponent {
  @Input() items: AccordionItem[] = [];
  @Input() parentPath: string = '';
  @Input() pathMode: 'id' | 'label' = 'label';
  @Input() isSearchItemVisible: boolean = false; // controls whether the search textbox is visible

  searchTerm: string = '';

  // Toggle expansion when the icon is clicked (only for items with children)
  toggleItem(item: AccordionItem): void {
    item.isOpen = !item.isOpen;
  }

  // Log item details (id, label, computed path) when the label is clicked.
  logItem(item: AccordionItem): void {
    const currentValue = this.pathMode === 'id' ? item.id : item.label;
    const fullPath = this.parentPath ? `${this.parentPath}|${currentValue}` : currentValue;
    console.log({ id: item.id, label: item.label, path: fullPath });
  }

  // Recursively filter items based on the search term.
  filterItems(items: AccordionItem[], term: string): AccordionItem[] {
    if (!term) return items;
    return items.reduce((acc: AccordionItem[], item: AccordionItem) => {
      const lowerTerm = term.toLowerCase();
      // Recursively filter children
      const filteredChildren = this.filterItems(item.children, term);
      // Determine if the current item matches the search term
      const isMatch = item.label.toLowerCase().includes(lowerTerm);
      // If this item matches or any child matches, include it.
      if (isMatch || filteredChildren.length > 0) {
        // Create a new object so we do not modify the original item.
        const newItem: AccordionItem = {
          ...item,
          children: filteredChildren,
          // Automatically expand if there are matching children.
          isOpen: filteredChildren.length > 0
        };
        acc.push(newItem);
      }
      return acc;
    }, []);
  }

  // Use filtered items when searchTerm is entered; otherwise, use original items.
  get displayedItems(): AccordionItem[] {
    return this.searchTerm ? this.filterItems(this.items, this.searchTerm) : this.items;
  }
}