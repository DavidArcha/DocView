import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AccordionSection } from '../../common/accordion-section.model';

@Component({
  selector: 'app-accordion-section',
  standalone: false,

  templateUrl: './accordion-section.component.html',
  styleUrl: './accordion-section.component.scss'
})
export class AccordionSectionComponent implements OnChanges {
  @Input() section!: AccordionSection;
  // The parent's path used to build the full path (e.g., "Category > SubCat-1")
  @Input() parentPath: string = '';
  // This flag is received from the global control.
  @Input() expandAll: boolean = false;

  // Local expanded state; starts collapsed by default.
  public isExpanded: boolean = false;

  // When the expandAll flag changes, update this section’s state.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['expandAll'] && !changes['expandAll'].firstChange) {
      this.isExpanded = this.expandAll;
    }
  }

  toggleSection(): void {
    this.isExpanded = !this.isExpanded;
  }

  onFieldClick(field: string): void {
    // Build the full path. If there's a parentPath, include it.
    const currentPath = this.parentPath ? `${this.parentPath} > ${this.section.title}` : this.section.title;
    console.log('Field Path:', `${currentPath} > ${field}`);
    console.log('Selected Field:', field);
  }
}