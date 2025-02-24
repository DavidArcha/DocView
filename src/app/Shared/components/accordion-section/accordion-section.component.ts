import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AccordionSection } from '../../common/accordion-section.model';
import { AccordionItem } from '../../interfaces/accordian-list.interface';

@Component({
  selector: 'app-accordion-section',
  standalone: false,
  templateUrl: './accordion-section.component.html',
  styleUrls: ['./accordion-section.component.scss']
})
export class AccordionSectionComponent implements OnChanges, OnInit {
  @Input() section!: AccordionItem;
  @Input() parentPath: string = '';
  @Output() fieldSelected = new EventEmitter<{ parent: string, field: string, path: string }>();

  public isExpanded: boolean = false;
  private storageKey: string = '';

  ngOnInit() {
    this.storageKey = `accordion_${this.parentPath}_${this.section.label}`.replace(/\s+/g, '_');
    this.restoreState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] || changes['parentPath']) {
      this.storageKey = `accordion_${this.parentPath}_${this.section.label}`.replace(/\s+/g, '_');
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

  handleFieldClick(fieldId: string) {
    const fieldPath = this.parentPath ? `${this.parentPath} > ${this.section.id}` : this.section.id;
    this.fieldSelected.emit({ parent: this.section.id, field: fieldId, path: fieldPath });
  }

  onChildFieldSelected(event: { parent: string; field: string; path: string }) {
    this.fieldSelected.emit(event);
  }
}