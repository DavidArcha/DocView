import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AccordionSection } from '../../common/accordion-section.model';
import { delay, Observable, of } from 'rxjs';

@Component({
  selector: 'app-accordion-section',
  standalone: false,
  templateUrl: './accordion-section.component.html',
  styleUrl: './accordion-section.component.scss'
})
export class AccordionSectionComponent implements OnChanges, OnInit {
  @Input() section!: AccordionSection;
  @Input() parentPath: string = '';
  // Emit the selected field event to the parent component.
  @Output() fieldSelected = new EventEmitter<{ parent: string, field: string }>();

  public isExpanded: boolean = false;
  private storageKey: string = '';

  ngOnInit() {
    // Create a unique key for this section based on its path and title
    this.storageKey = `accordion_${this.parentPath}_${this.section.title}`.replace(/\s+/g, '_');
    this.restoreState();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] || changes['parentPath']) {
      this.storageKey = `accordion_${this.parentPath}_${this.section.title}`.replace(/\s+/g, '_');
      this.restoreState();
    }
  }

  toggleSection(): void {
    this.isExpanded = !this.isExpanded;
    this.saveState();
  }

  private saveState(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.isExpanded));
  }

  private restoreState(): void {
    const savedState = localStorage.getItem(this.storageKey);
    if (savedState !== null) {
      this.isExpanded = JSON.parse(savedState);
    }
  }

  // Called when a field is clicked.
  handleFieldClick(field: string): void {
    // Build the parent's value as the complete path (without including the field)
    const parentValue = this.parentPath
      ? `${this.parentPath} > ${this.section.title}`
      : this.section.title;
    // Emit the event with both parent and field values.
    this.fieldSelected.emit({ parent: parentValue, field });
  }

  // If a child accordion section emits a fieldSelected event, simply re-emit it upward.
  onChildFieldSelected(event: { parent: string, field: string }): void {
    this.fieldSelected.emit(event);
  }
}