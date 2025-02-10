import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AccordionSection } from '../../common/accordion-section.model';
import { delay, Observable, of } from 'rxjs';

@Component({
  selector: 'app-accordion-section',
  standalone: false,

  templateUrl: './accordion-section.component.html',
  styleUrl: './accordion-section.component.scss'
})
export class AccordionSectionComponent implements OnChanges {
  @Input() section!: AccordionSection;
  @Input() parentPath: string = '';
  // Removed individual loading state since global loading is handled above.
  public isExpanded: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    // Here you can also listen for changes to inputs if needed.
  }

  toggleSection(): void {
    this.isExpanded = !this.isExpanded;
  }

  onFieldClick(field: string): void {
    const currentPath = this.parentPath
      ? `${this.parentPath} > ${this.section.title}`
      : this.section.title;
    console.log('Field Path:', `${currentPath} > ${field}`);
    console.log('Selected Field:', field);
  }
}