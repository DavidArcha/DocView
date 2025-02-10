import { Component, Input, OnInit } from '@angular/core';
import { accordionData } from '../../common/accordian';

@Component({
  selector: 'app-multilevel-accordion',
  standalone: false,
  templateUrl: './multilevel-accordion.component.html',
  styleUrl: './multilevel-accordion.component.scss'
})
export class MultilevelAccordionComponent implements OnInit {
  data = accordionData;
  expandedState: { [key: string]: boolean } = {};

  ngOnInit(): void {
    this.initializeState(this.data, '');
  }

  // Initialize the state object
  initializeState(items: any[], parentKey: string): void {
    items.forEach((item, index) => {
      const key = parentKey ? `${parentKey}-${index}` : `${index}`;
      this.expandedState[key] = false;

      if (item.children) {
        this.initializeState(item.children, key);
      }
    });
  }

  // Toggle the expanded state
  toggleItem(key: string): void {
    this.expandedState[key] = !this.expandedState[key];
  }

  // Helper function to get state key
  getStateKey(parentKey: string, index: number): string {
    return parentKey ? `${parentKey}-${index}` : `${index}`;
  }
}