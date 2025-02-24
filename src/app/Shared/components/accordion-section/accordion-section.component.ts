import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AccordionSection } from '../../common/accordion-section.model';

@Component({
  selector: 'app-accordion-section',
  standalone: false,
  templateUrl: './accordion-section.component.html',
  styleUrls: ['./accordion-section.component.scss']
})
export class AccordionSectionComponent implements OnChanges, OnInit {
  @Input() section!: AccordionSection;
  @Input() parentPath: string = '';
  @Output() fieldSelected = new EventEmitter<{ parent: string, field: string }>();

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

  handleFieldClick(field: string): void {
    const parentValue = this.parentPath
      ? `${this.parentPath} > ${this.section.label}`
      : this.section.label;
    this.fieldSelected.emit({ parent: parentValue, field });
    console.log('Field clicked:','Path:', parentValue,'Field:', field);
  }

  onChildFieldSelected(event: { parent: string, field: string }): void {
    this.fieldSelected.emit(event);
  }
}