import { Component, Input, OnInit } from '@angular/core';
import { AccordionSection } from '../../common/accordion-section.model';
import { accordionDataTypes } from '../../common/accordian';

@Component({
  selector: 'app-multilevel-accordion',
  standalone: false,
  templateUrl: './multilevel-accordion.component.html',
  styleUrl: './multilevel-accordion.component.scss'
})
export class MultilevelAccordionComponent implements OnInit {
  @Input() sections: AccordionSection[] = [];

  // Global flag to control expand/collapse all.
  public expandAll: boolean = false;

  ngOnInit(): void {
    this.sections = accordionDataTypes[0].sections;
  }

  toggleExpandAll(): void {
    this.expandAll = !this.expandAll;
  }
}