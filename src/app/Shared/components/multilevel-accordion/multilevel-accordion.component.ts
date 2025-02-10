import { Component, Input, OnInit } from '@angular/core';
import { AccordionSection } from '../../common/accordion-section.model';
import { accordionDataTypes } from '../../common/accordian';
import { delay, Observable, of } from 'rxjs';

@Component({
  selector: 'app-multilevel-accordion',
  standalone: false,
  templateUrl: './multilevel-accordion.component.html',
  styleUrl: './multilevel-accordion.component.scss'
})
export class MultilevelAccordionComponent implements OnInit {
  public sections: AccordionSection[] = [];
  public isLoading: boolean = true; // Global loading flag
  // Global flag to control expand/collapse all.
  public expandAll: boolean = false;

  ngOnInit() {
    this.loadAccordionData();
  }

  loadAccordionData(): void {
    // Set loading flag to true before the API call.
    this.isLoading = true;
    // Simulate an API call with a delay. Replace this with your actual API service.
    this.fetchAccordionData().subscribe(data => {
      this.sections = data;
      // Once data is loaded, remove the loader.
      this.isLoading = false;
    });
  }

  fetchAccordionData(): Observable<AccordionSection[]> {
    // Sample data based on your JSON structure.
    const data: AccordionSection[] = accordionDataTypes[0].sections;
    // Simulate a 1.5-second delay.
    return of(data).pipe(delay(1500));
  }


  toggleExpandAll(): void {
    this.expandAll = !this.expandAll;
  }
}