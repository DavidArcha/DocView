import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AccordionItem } from '../../interfaces/accordian-list.interface';
import { AccordionService } from '../../services/accordion.service';

@Component({
  selector: 'app-accordion-section',
  standalone: false,
  templateUrl: './accordion-section.component.html',
  styleUrls: ['./accordion-section.component.scss'],
  animations: [
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0',
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*'
      })),
      transition('collapsed <=> expanded', [
        animate('200ms ease-in-out')
      ])
    ])
  ]
})
export class AccordionSectionComponent implements OnInit, OnChanges {
  @Input() section!: AccordionItem;
  @Input() parentPath: string = '';
  @Input() defaultExpanded: boolean = false;
  @Input() isLoading: boolean = false;
  
  @Output() fieldSelected = new EventEmitter<{ parent: { id: string, label: string }, field: { id: string, label: string }, path: string }>();
  @Output() expandedChange = new EventEmitter<boolean>();

  public isExpanded: boolean = false;

  constructor(private accordionService: AccordionService) {}

  ngOnInit(): void {
    const expandedState = localStorage.getItem(this.getStorageKey());
    this.isExpanded = expandedState ? JSON.parse(expandedState) : this.accordionService.getExpandedState(this.section.id) || this.defaultExpanded;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && !changes['section'].firstChange) {
      // Handle section changes
      const expandedState = localStorage.getItem(this.getStorageKey());
      this.isExpanded = expandedState ? JSON.parse(expandedState) : this.defaultExpanded;
    }
  }

  toggleSection(): void {
    this.isExpanded = !this.isExpanded;
    this.expandedChange.emit(this.isExpanded);
    this.accordionService.setExpandedState(this.section.id, this.isExpanded);
    localStorage.setItem(this.getStorageKey(), JSON.stringify(this.isExpanded));
  }

  handleFieldClick(fieldId: string): void {
    const field = this.section.children?.find(child => child.id === fieldId);
    const fieldPath = this.parentPath ? `${this.parentPath} > ${this.section.id}` : this.section.id;
    if (field) {
      this.fieldSelected.emit({
        parent: { id: this.section.id, label: this.section.label },
        field: { id: field.id, label: field.label },
        path: fieldPath
      });
    }
  }

  onChildFieldSelected(event: { parent: { id: string, label: string }, field: { id: string, label: string }, path: string }): void {
    this.fieldSelected.emit(event);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.toggleSection();
      event.preventDefault();
    }
  }

  trackByFn(index: number, item: AccordionItem): string {
    return item.id;
  }

  // Public methods for parent components to control this accordion
  expand(): void {
    if (!this.isExpanded) {
      this.isExpanded = true;
      this.expandedChange.emit(true);
      this.accordionService.setExpandedState(this.section.id, this.isExpanded);
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.isExpanded));
    }
  }

  collapse(): void {
    if (this.isExpanded) {
      this.isExpanded = false;
      this.expandedChange.emit(false);
      this.accordionService.setExpandedState(this.section.id, this.isExpanded);
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.isExpanded));
    }
  }

  private getStorageKey(): string {
    return `accordion-section-${this.section.id}`;
  }
}